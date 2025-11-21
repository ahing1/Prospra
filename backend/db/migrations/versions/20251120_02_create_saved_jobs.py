"""create saved_jobs table

Revision ID: 20251120_02
Revises: 20251120_01
Create Date: 2025-11-20 20:20:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20251120_02"
down_revision = "20251120_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "saved_jobs",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("user_id", sa.String(length=128), nullable=False),
    sa.Column("job_id", sa.String(length=128), nullable=False),
    sa.Column("job_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.Column(
      "updated_at",
      sa.DateTime(timezone=True),
      nullable=False,
      server_default=sa.func.now(),
      server_onupdate=sa.func.now(),
    ),
    sa.UniqueConstraint("user_id", "job_id", name="uq_saved_jobs_user_job"),
  )
  op.create_index("ix_saved_jobs_user_id", "saved_jobs", ["user_id"])
  op.create_index("ix_saved_jobs_job_id", "saved_jobs", ["job_id"])


def downgrade() -> None:
  op.drop_index("ix_saved_jobs_job_id", table_name="saved_jobs")
  op.drop_index("ix_saved_jobs_user_id", table_name="saved_jobs")
  op.drop_table("saved_jobs")
