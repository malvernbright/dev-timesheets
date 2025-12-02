from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TimeEntry, User
from app.repositories.project_repository import ProjectRepository
from app.repositories.time_entry_repository import TimeEntryRepository
from app.schemas.time_entry import TimeEntryCreate, TimeEntryUpdate


class TimeEntryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.entries = TimeEntryRepository(session)
        self.projects = ProjectRepository(session)

    async def list_for_user(
        self,
        user: User,
        *,
        project_ids: list[int] | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[TimeEntry]:
        return await self.entries.list_filtered(
            user_id=user.id,
            project_ids=project_ids,
            date_from=date_from,
            date_to=date_to,
        )

    async def create(self, user: User, data: TimeEntryCreate) -> TimeEntry:
        await self._ensure_project_access(user, data.project_id)
        entry = TimeEntry(user_id=user.id, **data.model_dump())
        await self.entries.add(entry)
        await self.session.commit()
        await self.session.refresh(entry)
        return entry

    async def update(
        self, user: User, entry_id: int, data: TimeEntryUpdate
    ) -> TimeEntry:
        entry = await self._get_owned_entry(user, entry_id)
        payload = data.model_dump(exclude_unset=True)
        if "project_id" in payload:
            await self._ensure_project_access(user, payload["project_id"])
        for field, value in payload.items():
            setattr(entry, field, value)
        await self.session.commit()
        await self.session.refresh(entry)
        return entry

    async def delete(self, user: User, entry_id: int) -> None:
        entry = await self._get_owned_entry(user, entry_id)
        await self.entries.delete(entry)
        await self.session.commit()

    async def _get_owned_entry(self, user: User, entry_id: int) -> TimeEntry:
        entry = await self.entries.get(entry_id)
        if not entry or entry.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Time entry not found"
            )
        return entry

    async def _ensure_project_access(self, user: User, project_id: int) -> None:
        project = await self.projects.get(project_id)
        if not project or project.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )
