from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, List, Optional

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class JobSearch(Base):
  __tablename__ = "job_searches"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  query: Mapped[str] = mapped_column(String(255), index=True)
  location: Mapped[str] = mapped_column(String(255))
  page: Mapped[int] = mapped_column(Integer, default=1)
  employment_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
  role_filters: Mapped[List[str]] = mapped_column(JSONB, default=list)
  seniority_filters: Mapped[List[str]] = mapped_column(JSONB, default=list)
  response_payload: Mapped[dict[str, Any]] = mapped_column(JSONB)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
