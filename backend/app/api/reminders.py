from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session, get_current_user
from app.models import User
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate
from app.services.reminder_service import ReminderService

router = APIRouter()


@router.get("/", response_model=list[ReminderRead])
async def list_reminders(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[ReminderRead]:
    service = ReminderService(session)
    reminders = await service.list_for_user(current_user)
    return [ReminderRead.model_validate(item) for item in reminders]


@router.post("/", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    payload: ReminderCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ReminderRead:
    service = ReminderService(session)
    reminder = await service.create(current_user, payload)
    return ReminderRead.model_validate(reminder)


@router.patch("/{reminder_id}", response_model=ReminderRead)
async def update_reminder(
    reminder_id: int,
    payload: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ReminderRead:
    service = ReminderService(session)
    reminder = await service.update(current_user, reminder_id, payload)
    return ReminderRead.model_validate(reminder)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    service = ReminderService(session)
    await service.delete(current_user, reminder_id)
