"""create user_subscriptions table

Revision ID: 20251123_05
Revises: 20251122_04
Create Date: 2025-11-23 14:40:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20251123_05"
down_revision = "20251122_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "user_subscriptions",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("user_id", sa.String(length=191), nullable=False),
    sa.Column("plan", sa.String(length=32), nullable=False, server_default="monthly"),
    sa.Column("status", sa.String(length=32), nullable=False, server_default="inactive"),
    sa.Column("stripe_customer_id", sa.String(length=191), nullable=True),
    sa.Column("stripe_subscription_id", sa.String(length=191), nullable=True),
    sa.Column("stripe_checkout_session_id", sa.String(length=191), nullable=True),
    sa.Column("stripe_payment_intent_id", sa.String(length=191), nullable=True),
    sa.Column("entitlement_expires_at", sa.DateTime(timezone=True), nullable=True),
    sa.Column("last_event_id", sa.String(length=255), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.Column(
      "updated_at",
      sa.DateTime(timezone=True),
      nullable=False,
      server_default=sa.func.now(),
      server_onupdate=sa.func.now(),
    ),
    sa.UniqueConstraint("user_id", name="uq_user_subscriptions_user"),
  )
  op.create_index("ix_user_subscriptions_user_id", "user_subscriptions", ["user_id"])
  op.create_index(
    "ix_user_subscriptions_stripe_subscription_id",
    "user_subscriptions",
    ["stripe_subscription_id"],
  )
  op.create_index(
    "ix_user_subscriptions_stripe_checkout_session_id",
    "user_subscriptions",
    ["stripe_checkout_session_id"],
  )
  op.create_index(
    "ix_user_subscriptions_stripe_payment_intent_id",
    "user_subscriptions",
    ["stripe_payment_intent_id"],
  )


def downgrade() -> None:
  op.drop_index("ix_user_subscriptions_stripe_payment_intent_id", table_name="user_subscriptions")
  op.drop_index("ix_user_subscriptions_stripe_checkout_session_id", table_name="user_subscriptions")
  op.drop_index("ix_user_subscriptions_stripe_subscription_id", table_name="user_subscriptions")
  op.drop_index("ix_user_subscriptions_user_id", table_name="user_subscriptions")
  op.drop_table("user_subscriptions")
