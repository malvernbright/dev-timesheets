from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project
from app.repositories.base import Repository


class ProjectRepository(Repository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Project)

    async def list_by_owner(self, owner_id: int) -> list[Project]:
        stmt = select(Project).where(
            Project.owner_id == owner_id, Project.is_archived.is_(False)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_ids(self, project_ids: list[int]) -> dict[int, Project]:
        if not project_ids:
            return {}
        stmt = select(Project).where(Project.id.in_(project_ids))
        result = await self.session.execute(stmt)
        projects = result.scalars().all()
        return {project.id: project for project in projects}
