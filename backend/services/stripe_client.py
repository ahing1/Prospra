import asyncio
import os
from functools import lru_cache

import stripe
from dotenv import load_dotenv

load_dotenv()


class StripeCheckoutError(Exception):
  """Raised when Stripe checkout session creation fails."""


class StripeWebhookError(Exception):
  """Raised when Stripe webhook payload verification fails."""


def _get_required_env(name: str) -> str:
  value = os.getenv(name)
  if not value:
    raise StripeCheckoutError(f"{name} environment variable is required for Stripe checkout.")
  return value


PLAN_ENV_KEYS = {
  "monthly": "STRIPE_MONTHLY_PRICE_ID",
  "lifetime": "STRIPE_LIFETIME_PRICE_ID",
}

PLAN_MODE = {
  "monthly": "subscription",
  "lifetime": "payment",
}


@lru_cache
def _get_api_key() -> str:
  value = os.getenv("STRIPE_SECRET_KEY")
  if not value:
    raise StripeCheckoutError("STRIPE_SECRET_KEY environment variable is required for Stripe checkout.")
  return value


def get_stripe_client() -> stripe:
  stripe.api_key = _get_api_key()
  return stripe


def normalize_plan(plan: str | None = "monthly") -> str:
  return (plan or "monthly").lower()


def _resolve_price_id(plan: str | None) -> str:
  normalized = (plan or "monthly").lower()
  env_name = PLAN_ENV_KEYS.get(normalized)
  if env_name:
    price = os.getenv(env_name)
    if price:
      return price
  fallback = os.getenv("STRIPE_PRICE_ID")
  if fallback:
    return fallback
  available_plans = ", ".join(PLAN_ENV_KEYS.keys())
  raise StripeCheckoutError(
    f"No Stripe price configured for plan '{normalized}'. Set STRIPE_PRICE_ID or STRIPE_<PLAN>_PRICE_ID ({available_plans})."
  )


async def create_checkout_session(user_id: str, plan: str | None = "monthly") -> stripe.checkout.Session:
  """Create a Stripe Checkout session for the current user."""
  normalized_plan = normalize_plan(plan)
  price_id = _resolve_price_id(plan)
  success_url = _get_required_env("STRIPE_SUCCESS_URL")
  cancel_url = _get_required_env("STRIPE_CANCEL_URL")
  checkout_mode = PLAN_MODE.get(normalized_plan, "subscription")
  metadata = {"user_id": user_id, "plan": normalized_plan}

  def _create_session() -> stripe.checkout.Session:
    client = get_stripe_client()
    session_params: dict = {
      "mode": checkout_mode,
      "line_items": [{"price": price_id, "quantity": 1}],
      "success_url": success_url,
      "cancel_url": cancel_url,
      "client_reference_id": user_id,
      "metadata": metadata,
    }
    if checkout_mode == "subscription":
      session_params["subscription_data"] = {"metadata": metadata}
    else:
      session_params["payment_intent_data"] = {"metadata": metadata}
    return client.checkout.Session.create(**session_params)

  try:
    return await asyncio.to_thread(_create_session)
  except stripe.error.StripeError as exc:  # type: ignore[attr-defined]
    user_message = getattr(exc, "user_message", None) or "Unable to create Stripe checkout session."
    raise StripeCheckoutError(user_message) from exc


def construct_webhook_event(payload: bytes, signature_header: str) -> stripe.Event:
  secret = os.getenv("STRIPE_WEBHOOK_SECRET")
  if not secret:
    raise StripeWebhookError("STRIPE_WEBHOOK_SECRET environment variable is required for Stripe webhooks.")
  try:
    return stripe.Webhook.construct_event(payload=payload, sig_header=signature_header, secret=secret)
  except ValueError as exc:
    raise StripeWebhookError("Invalid Stripe webhook payload.") from exc
  except stripe.error.SignatureVerificationError as exc:  # type: ignore[attr-defined]
    raise StripeWebhookError("Invalid Stripe webhook signature.") from exc
