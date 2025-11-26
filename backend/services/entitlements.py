from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from db.repositories.user_subscription_repository import get_subscription_for_user


ACTIVE_STATUSES = {"active", "trialing", "paid", "complete", "succeeded"}


def _is_entitled(status: str | None, expires_at: datetime | None) -> bool:
  """Return True when the subscription status is active and not expired."""
  if not status:
    return False
  normalized = status.lower()
  if normalized not in ACTIVE_STATUSES:
    return False
  if not expires_at:
    return True
  return expires_at > datetime.now(timezone.utc)


@dataclass
class UserEntitlement:
  status: Optional[str]
  plan: Optional[str]
  entitlement_expires_at: Optional[datetime]
  last_event_id: Optional[str]

  @property
  def entitled(self) -> bool:
    return _is_entitled(self.status, self.entitlement_expires_at)


async def fetch_user_entitlement(session: AsyncSession, user_id: str) -> UserEntitlement:
  """Load a user's subscription record and compute entitlement status."""
  record = await get_subscription_for_user(session, user_id)
  if not record:
    return UserEntitlement(status=None, plan=None, entitlement_expires_at=None, last_event_id=None)

  return UserEntitlement(
    status=record.status,
    plan=record.plan,
    entitlement_expires_at=record.entitlement_expires_at,
    last_event_id=record.last_event_id,
  )
