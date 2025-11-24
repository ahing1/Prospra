from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Literal, cast

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.repositories.user_subscription_repository import (
  get_subscription_by_stripe_id,
  get_subscription_for_user,
  upsert_user_subscription,
)
from routes.dependencies import require_user_id
from services.stripe_client import (
  StripeCheckoutError,
  StripeWebhookError,
  construct_webhook_event,
  create_checkout_session,
  normalize_plan,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
  plan: Literal["monthly", "lifetime"] = "monthly"


class BillingStatusResponse(BaseModel):
  status: str | None
  plan: str | None
  entitled: bool
  entitlement_expires_at: datetime | None
  last_event_id: str | None = None


def _get_metadata_value(payload: dict[str, Any], field: str) -> str | None:
  metadata = payload.get("metadata") or {}
  try:
    return metadata.get(field)
  except AttributeError:
    return None


def _timestamp_to_datetime(timestamp: Any) -> datetime | None:
  if not timestamp:
    return None
  try:
    return datetime.fromtimestamp(int(timestamp), tz=timezone.utc)
  except (TypeError, ValueError, OSError):
    return None


def _is_entitled(status: str | None, expires_at: datetime | None) -> bool:
  if not status:
    return False
  normalized = status.lower()
  active_states = {"active", "trialing", "paid", "complete", "succeeded"}
  if normalized not in active_states:
    return False
  if not expires_at:
    return True
  return expires_at > datetime.now(timezone.utc)


@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def start_checkout_session(
  payload: CheckoutRequest,
  user_id: str = Depends(require_user_id),
):
  try:
    session = await create_checkout_session(user_id, plan=payload.plan)
  except StripeCheckoutError as exc:
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
  return {"checkout_url": session.url}


@router.get("/status", response_model=BillingStatusResponse)
async def billing_status(
  user_id: str = Depends(require_user_id),
  db: AsyncSession = Depends(get_db),
):
  record = await get_subscription_for_user(db, user_id)
  if not record:
    return BillingStatusResponse(status=None, plan=None, entitled=False, entitlement_expires_at=None, last_event_id=None)

  entitled = _is_entitled(record.status, record.entitlement_expires_at)
  return BillingStatusResponse(
    status=record.status,
    plan=record.plan,
    entitled=entitled,
    entitlement_expires_at=record.entitlement_expires_at,
    last_event_id=record.last_event_id,
  )


@router.post("/webhook", status_code=status.HTTP_200_OK, include_in_schema=False)
async def stripe_webhook(
  request: Request,
  db: AsyncSession = Depends(get_db),
):
  payload = await request.body()
  signature = request.headers.get("Stripe-Signature")
  if not signature:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Stripe-Signature header.")

  try:
    event = construct_webhook_event(payload, signature)
  except StripeWebhookError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  event_dict: dict[str, Any]
  if hasattr(event, "to_dict_recursive"):
    event_dict = event.to_dict_recursive()
  else:
    event_dict = cast(dict[str, Any], event)
  event_type = event_dict.get("type")
  event_id = event_dict.get("id")
  data = event_dict.get("data", {}).get("object", {})

  handler_map = {
    "checkout.session.completed": _handle_checkout_session_completed,
    "checkout.session.async_payment_succeeded": _handle_checkout_session_completed,
    "customer.subscription.updated": _handle_subscription_updated,
    "customer.subscription.deleted": _handle_subscription_updated,
  }
  handler = handler_map.get(event_type)
  if not handler:
    logger.debug("Ignoring unsupported Stripe event %s", event_type)
    return {"processed": False}

  await handler(data, event_id, event_type, db)
  return {"processed": True}


async def _handle_checkout_session_completed(
  payload: dict[str, Any],
  event_id: str | None,
  event_type: str | None,
  db: AsyncSession,
) -> None:
  user_id = payload.get("client_reference_id") or _get_metadata_value(payload, "user_id")
  if not user_id:
    logger.warning("Stripe checkout session %s missing user_id metadata", payload.get("id"))
    return

  plan = normalize_plan(_get_metadata_value(payload, "plan"))
  status = "active" if payload.get("payment_status") == "paid" else payload.get("status", "open")
  await upsert_user_subscription(
    db,
    user_id=user_id,
    plan=plan,
    status=status,
    stripe_customer_id=payload.get("customer"),
    stripe_subscription_id=payload.get("subscription"),
    stripe_checkout_session_id=payload.get("id"),
    stripe_payment_intent_id=payload.get("payment_intent"),
    last_event_id=event_id,
  )
  logger.info("Processed Stripe checkout event %s for user %s", event_type, user_id)


async def _handle_subscription_updated(
  payload: dict[str, Any],
  event_id: str | None,
  event_type: str | None,
  db: AsyncSession,
) -> None:
  metadata_user_id = _get_metadata_value(payload, "user_id")
  user_id = metadata_user_id
  if not user_id:
    record = await get_subscription_by_stripe_id(db, payload.get("id"))
    user_id = record.user_id if record else None
  if not user_id:
    logger.warning("Stripe subscription %s missing user mapping", payload.get("id"))
    return

  plan_value = _get_metadata_value(payload, "plan")
  plan = normalize_plan(plan_value) if plan_value else None
  expires_at = _timestamp_to_datetime(payload.get("current_period_end"))
  status = payload.get("status") or ("canceled" if event_type == "customer.subscription.deleted" else None)

  await upsert_user_subscription(
    db,
    user_id=user_id,
    plan=plan,
    status=status,
    stripe_customer_id=payload.get("customer"),
    stripe_subscription_id=payload.get("id"),
    entitlement_expires_at=expires_at,
    last_event_id=event_id,
  )
  logger.info("Processed Stripe subscription event %s for user %s", event_type, user_id)
