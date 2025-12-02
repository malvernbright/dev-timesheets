from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Reminder, User
from app.repositories.reminder_repository import ReminderRepository
from app.schemas.reminder import ReminderCreate, ReminderUpdate


class ReminderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.reminders = ReminderRepository(session)

    async def list_for_user(self, user: User) -> list[Reminder]:
        return await self.reminders.list_active_by_user(user.id)

    async def create(self, user: User, payload: ReminderCreate) -> Reminder:
        reminder = Reminder(user_id=user.id, **payload.model_dump())
        await self.reminders.add(reminder)
        await self.session.commit()
        await self.session.refresh(reminder)
        self._schedule_task(reminder)
        return reminder

    async def update(
        self, user: User, reminder_id: int, payload: ReminderUpdate
    ) -> Reminder:
        reminder = await self._get_owned(user, reminder_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(reminder, field, value)
        await self.session.commit()
        await self.session.refresh(reminder)
        self._schedule_task(reminder)
        return reminder

    async def delete(self, user: User, reminder_id: int) -> None:
        reminder = await self._get_owned(user, reminder_id)
        await self.reminders.delete(reminder)
        await self.session.commit()

    async def _get_owned(self, user: User, reminder_id: int) -> Reminder:
        reminder = await self.reminders.get(reminder_id)
        if not reminder or reminder.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found"
            )
        return reminder

    def _schedule_task(self, reminder: Reminder) -> None:
        if not reminder.is_active:
            return
        from app.celery.app import celery_app

        celery_app.send_task("app.celery.tasks.enqueue_reminder", args=[reminder.id])
