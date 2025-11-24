from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.user_subscription import UserSubscription


async def get_subscription_for_user(session: AsyncSession, user_id: str) -> Optional[UserSubscription]:
  stmt: Select[UserSubscription] = select(UserSubscription).where(UserSubscription.user_id == user_id).limit(1)
  result = await session.execute(stmt)
  return result.scalar_one_or_none()


async def get_subscription_by_stripe_id(
  session: AsyncSession,
  stripe_subscription_id: str | None,
) -> Optional[UserSubscription]:
  if not stripe_subscription_id:
    return None
  stmt: Select[UserSubscription] = (
    select(UserSubscription)
    .where(UserSubscription.stripe_subscription_id == stripe_subscription_id)
    .limit(1)
  )
  result = await session.execute(stmt)
  return result.scalar_one_or_none()


async def upsert_user_subscription(
  session: AsyncSession,
  *,
  user_id: str,
  plan: str | None = None,
  status: str | None = None,
  stripe_customer_id: str | None = None,
  stripe_subscription_id: str | None = None,
  stripe_checkout_session_id: str | None = None,
  stripe_payment_intent_id: str | None = None,
  entitlement_expires_at: datetime | None = None,
  last_event_id: str | None = None,
) -> UserSubscription:
  record = await get_subscription_for_user(session, user_id)
  if not record:
    record = UserSubscription(user_id=user_id)

  def _set(attr: str, value, *, allow_none: bool = False) -> None:
    if value is None and not allow_none:
      return
    setattr(record, attr, value)

  _set("plan", plan)
  _set("status", status)
  _set("stripe_customer_id", stripe_customer_id)
  _set("stripe_subscription_id", stripe_subscription_id)
  _set("stripe_checkout_session_id", stripe_checkout_session_id)
  _set("stripe_payment_intent_id", stripe_payment_intent_id)
  _set("entitlement_expires_at", entitlement_expires_at, allow_none=True)
  _set("last_event_id", last_event_id)

  session.add(record)
  await session.commit()
  await session.refresh(record)
  return record
