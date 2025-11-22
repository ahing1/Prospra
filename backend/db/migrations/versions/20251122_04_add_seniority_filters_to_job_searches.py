"""add seniority filters to job searches

Revision ID: 20251122_04
Revises: 20251120_03_expand_saved_jobs_lengths
Create Date: 2025-11-22 13:45:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20251122_04"
down_revision = "20251120_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.add_column(
    "job_searches",
    sa.Column("seniority_filters", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
  )
  op.alter_column("job_searches", "seniority_filters", server_default=None)


def downgrade() -> None:
  op.drop_column("job_searches", "seniority_filters")
