from __future__ import annotations

from typing import List, TYPE_CHECKING

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.integration import IntegrationToken
    from app.models.project import Project
    from app.models.reminder import Reminder
    from app.models.report import ReportExport
    from app.models.time_entry import TimeEntry


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(320), unique=True, index=True, nullable=False
    )
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(512), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    projects: Mapped[List["Project"]] = relationship("Project", back_populates="owner")
    time_entries: Mapped[List["TimeEntry"]] = relationship(
        "TimeEntry", back_populates="user"
    )
    reminders: Mapped[List["Reminder"]] = relationship(
        "Reminder", back_populates="user"
    )
    report_exports: Mapped[List["ReportExport"]] = relationship(
        "ReportExport", back_populates="user"
    )
    integration_tokens: Mapped[List["IntegrationToken"]] = relationship(
        "IntegrationToken", back_populates="user"
    )
