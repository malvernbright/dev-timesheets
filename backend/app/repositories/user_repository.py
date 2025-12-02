from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.repositories.base import Repository


class UserRepository(Repository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        normalized_email = email.strip().lower()
        stmt = select(User).where(func.lower(User.email) == normalized_email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
