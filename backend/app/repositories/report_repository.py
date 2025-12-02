from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ReportExport
from app.repositories.base import Repository


class ReportExportRepository(Repository[ReportExport]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ReportExport)

    async def list_by_user(self, user_id: int) -> list[ReportExport]:
        stmt = select(ReportExport).where(ReportExport.user_id == user_id).order_by(ReportExport.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()
