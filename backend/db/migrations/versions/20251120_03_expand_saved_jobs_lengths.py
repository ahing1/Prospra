"""expand saved job id lengths

Revision ID: 20251120_03
Revises: 20251120_02
Create Date: 2025-11-21 02:18:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20251120_03"
down_revision = "20251120_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.alter_column("saved_jobs", "user_id", type_=sa.String(length=191), existing_type=sa.String(length=128))
  op.alter_column("saved_jobs", "job_id", type_=sa.String(length=512), existing_type=sa.String(length=128))


def downgrade() -> None:
  op.alter_column("saved_jobs", "job_id", type_=sa.String(length=128), existing_type=sa.String(length=512))
  op.alter_column("saved_jobs", "user_id", type_=sa.String(length=128), existing_type=sa.String(length=191))
