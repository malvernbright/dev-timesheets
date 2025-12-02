from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Reminder
from app.repositories.base import Repository


class ReminderRepository(Repository[Reminder]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Reminder)

    async def list_active_by_user(self, user_id: int) -> list[Reminder]:
        stmt = select(Reminder).where(
            Reminder.user_id == user_id, Reminder.is_active.is_(True)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_all_active(self) -> list[Reminder]:
        stmt = select(Reminder).where(Reminder.is_active.is_(True))
        result = await self.session.execute(stmt)
        return result.scalars().all()
