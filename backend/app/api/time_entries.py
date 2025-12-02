from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session, get_current_user
from app.models import User
from app.schemas.time_entry import TimeEntryCreate, TimeEntryRead, TimeEntryUpdate
from app.services.time_entry_service import TimeEntryService

router = APIRouter()


@router.get("/", response_model=list[TimeEntryRead])
async def list_time_entries(
    project_ids: list[int] | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[TimeEntryRead]:
    service = TimeEntryService(session)
    entries = await service.list_for_user(
        current_user,
        project_ids=project_ids,
        date_from=date_from,
        date_to=date_to,
    )
    return [TimeEntryRead.model_validate(entry) for entry in entries]


@router.post("/", response_model=TimeEntryRead, status_code=status.HTTP_201_CREATED)
async def create_time_entry(
    payload: TimeEntryCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TimeEntryRead:
    service = TimeEntryService(session)
    entry = await service.create(current_user, payload)
    return TimeEntryRead.model_validate(entry)


@router.patch("/{entry_id}", response_model=TimeEntryRead)
async def update_time_entry(
    entry_id: int,
    payload: TimeEntryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TimeEntryRead:
    service = TimeEntryService(session)
    entry = await service.update(current_user, entry_id, payload)
    return TimeEntryRead.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    service = TimeEntryService(session)
    await service.delete(current_user, entry_id)
