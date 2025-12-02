from __future__ import annotations

from datetime import datetime

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TimeEntry
from app.repositories.base import Repository


class TimeEntryRepository(Repository[TimeEntry]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, TimeEntry)

    def _base_query(self) -> Select[tuple[TimeEntry]]:
        return select(TimeEntry)

    def _apply_filters(
        self,
        stmt: Select[tuple[TimeEntry]],
        *,
        user_id: int,
        project_ids: list[int] | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> Select[tuple[TimeEntry]]:
        stmt = stmt.where(TimeEntry.user_id == user_id)
        if project_ids:
            stmt = stmt.where(TimeEntry.project_id.in_(project_ids))
        if date_from:
            stmt = stmt.where(TimeEntry.started_at >= date_from)
        if date_to:
            stmt = stmt.where(TimeEntry.started_at <= date_to)
        return stmt

    async def list_filtered(
        self,
        *,
        user_id: int,
        project_ids: list[int] | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[TimeEntry]:
        stmt = self._apply_filters(
            self._base_query(),
            user_id=user_id,
            project_ids=project_ids,
            date_from=date_from,
            date_to=date_to,
        )
        result = await self.session.execute(stmt.order_by(TimeEntry.started_at.desc()))
        return result.scalars().all()
