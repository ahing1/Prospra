from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class UserSubscription(Base):
  __tablename__ = "user_subscriptions"
  __table_args__ = (UniqueConstraint("user_id", name="uq_user_subscriptions_user"),)

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[str] = mapped_column(String(191), nullable=False, index=True)
  plan: Mapped[str] = mapped_column(String(32), nullable=False, default="monthly")
  status: Mapped[str] = mapped_column(String(32), nullable=False, default="inactive")
  stripe_customer_id: Mapped[str | None] = mapped_column(String(191), nullable=True)
  stripe_subscription_id: Mapped[str | None] = mapped_column(String(191), nullable=True, index=True)
  stripe_checkout_session_id: Mapped[str | None] = mapped_column(String(191), nullable=True, index=True)
  stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(191), nullable=True, index=True)
  entitlement_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
  last_event_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    onupdate=func.now(),
    nullable=False,
  )
