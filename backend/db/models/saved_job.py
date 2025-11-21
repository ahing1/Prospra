from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class SavedJob(Base):
  __tablename__ = "saved_jobs"
  __table_args__ = (
    UniqueConstraint("user_id", "job_id", name="uq_saved_jobs_user_job"),
  )

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[str] = mapped_column(String(191), index=True)
  job_id: Mapped[str] = mapped_column(String(512), index=True)
  job_data: Mapped[dict] = mapped_column(JSONB)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    onupdate=func.now(),
    nullable=False,
  )
