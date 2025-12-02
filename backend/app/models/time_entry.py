from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


class TimeEntry(Base):
    __tablename__ = "time_entries"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    started_at: Mapped[datetime] = mapped_column(nullable=False, index=True)
    ended_at: Mapped[datetime | None] = mapped_column(nullable=True)
    duration_minutes: Mapped[int] = mapped_column(nullable=False)
    is_billable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    hourly_rate: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    user: Mapped["User"] = relationship(back_populates="time_entries")
    project: Mapped["Project"] = relationship(back_populates="time_entries")
