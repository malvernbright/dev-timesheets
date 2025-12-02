from __future__ import annotations

import asyncio
import logging
from datetime import date

from app.celery.app import celery_app
from app.core.db import SessionLocal
from app.models import ReportExport, User
from app.models.report import ExportFormat
from app.repositories.reminder_repository import ReminderRepository
from app.repositories.report_repository import ReportExportRepository
from app.schemas.report import ReportFilters
from app.services.exporters import export_to_csv, export_to_pdf
from app.services.report_service import ReportService

logger = logging.getLogger(__name__)


def _export_filename(export: ReportExport) -> str:
    return f"report_{export.id}.{export.format}"


async def _generate_export(export_id: int) -> None:
    async with SessionLocal() as session:
        repo = ReportExportRepository(session)
        export = await repo.get(export_id)
        if not export:
            logger.error("Export %s not found", export_id)
            return
        user = await session.get(User, export.user_id)
        if not user:
            logger.error("User missing for export %s", export.id)
            export.status = "failed"
            await session.commit()
            return

        filters = ReportFilters(
            project_ids=export.project_ids,
            date_from=date.fromisoformat(export.date_from),
            date_to=date.fromisoformat(export.date_to),
        )
        service = ReportService(session)
        report = await service.summarize(user, filters)
        if export.format == ExportFormat.CSV.value:
            file_path = export_to_csv(report, _export_filename(export))
        else:
            file_path = export_to_pdf(report, _export_filename(export))
        export.file_path = file_path
        export.status = "completed"
        await session.commit()


@celery_app.task(name="app.celery.tasks.generate_report_export")
def generate_report_export(export_id: int) -> None:
    asyncio.run(_generate_export(export_id))


async def _enqueue_reminder(reminder_id: int) -> None:
    async with SessionLocal() as session:
        repo = ReminderRepository(session)
        reminder = await repo.get(reminder_id)
        if not reminder:
            logger.warning("Reminder %s missing", reminder_id)
            return
        # Placeholder: perform notification dispatch
        logger.info("Reminder %s triggered via %s", reminder.id, reminder.channel)


@celery_app.task(name="app.celery.tasks.enqueue_reminder")
def enqueue_reminder(reminder_id: int) -> None:
    asyncio.run(_enqueue_reminder(reminder_id))


async def _dispatch_active_reminders() -> None:
    async with SessionLocal() as session:
        repo = ReminderRepository(session)
        reminders = await repo.list_all_active()
        for reminder in reminders:
            logger.info(
                "Dispatching reminder %s to channel %s", reminder.id, reminder.channel
            )


@celery_app.task(name="app.celery.tasks.dispatch_reminders")
def dispatch_reminders() -> None:
    asyncio.run(_dispatch_active_reminders())
