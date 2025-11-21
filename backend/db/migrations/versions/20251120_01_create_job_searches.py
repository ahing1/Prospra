"""create job_searches table

Revision ID: 20251120_01
Revises:
Create Date: 2025-11-20 19:46:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20251120_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "job_searches",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
    sa.Column("query", sa.String(length=255), nullable=False),
    sa.Column("location", sa.String(length=255), nullable=False),
    sa.Column("page", sa.Integer(), nullable=False, server_default="1"),
    sa.Column("employment_type", sa.String(length=64), nullable=True),
    sa.Column(
      "role_filters",
      postgresql.JSONB(astext_type=sa.Text()),
      nullable=False,
      server_default=sa.text("'[]'::jsonb"),
    ),
    sa.Column("response_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
  )
  op.create_index("ix_job_searches_query", "job_searches", ["query"])
  op.create_index("ix_job_searches_created_at", "job_searches", ["created_at"])


def downgrade() -> None:
  op.drop_index("ix_job_searches_created_at", table_name="job_searches")
  op.drop_index("ix_job_searches_query", table_name="job_searches")
  op.drop_table("job_searches")
