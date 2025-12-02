from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class ExportFormat(str, Enum):
    CSV = "csv"
    PDF = "pdf"


class ReportExport(Base):
    __tablename__ = "report_exports"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_ids: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)
    date_from: Mapped[str] = mapped_column(String(32), nullable=False)
    date_to: Mapped[str] = mapped_column(String(32), nullable=False)
    format: Mapped[str] = mapped_column(String(8), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    task_id: Mapped[str | None] = mapped_column(String(128), nullable=True)

    user: Mapped["User"] = relationship(back_populates="report_exports")
