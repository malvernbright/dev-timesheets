from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class IntegrationToken(Base):
    __tablename__ = "integration_tokens"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    access_token: Mapped[str] = mapped_column(String(1024), nullable=False)
    details: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="integration_tokens")
