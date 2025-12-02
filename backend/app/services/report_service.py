from collections import defaultdict
from datetime import datetime, time

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ReportExport, User
from app.repositories.project_repository import ProjectRepository
from app.repositories.report_repository import ReportExportRepository
from app.repositories.time_entry_repository import TimeEntryRepository
from app.schemas.report import (
    ExportRequest,
    ReportFilters,
    ReportResponse,
    ReportSummary,
)


class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.entries = TimeEntryRepository(session)
        self.projects = ProjectRepository(session)
        self.exports = ReportExportRepository(session)

    async def summarize(self, user: User, filters: ReportFilters) -> ReportResponse:
        await self._validate_project_scope(user, filters.project_ids)
        date_from_dt = datetime.combine(filters.date_from, time.min)
        date_to_dt = datetime.combine(filters.date_to, time.max)
        entries = await self.entries.list_filtered(
            user_id=user.id,
            project_ids=filters.project_ids,
            date_from=date_from_dt,
            date_to=date_to_dt,
        )
        project_map = await self.projects.get_by_ids(
            list({entry.project_id for entry in entries})
        )

        summary = defaultdict(lambda: {"total_minutes": 0, "total_billable_minutes": 0})
        for entry in entries:
            bucket = summary[entry.project_id]
            bucket["total_minutes"] += entry.duration_minutes
            if entry.is_billable:
                bucket["total_billable_minutes"] += entry.duration_minutes

        summary_list = [
            ReportSummary(
                project_id=project_id,
                project_name=(
                    project_map.get(project_id).name
                    if project_map.get(project_id)
                    else "Unknown"
                ),
                total_minutes=values["total_minutes"],
                total_billable_minutes=values["total_billable_minutes"],
            )
            for project_id, values in summary.items()
        ]

        total_minutes = sum(item.total_minutes for item in summary_list)
        total_billable = sum(item.total_billable_minutes for item in summary_list)
        return ReportResponse(
            summary=summary_list,
            total_minutes=total_minutes,
            total_billable_minutes=total_billable,
        )

    async def request_export(self, user: User, payload: ExportRequest) -> ReportExport:
        await self._validate_project_scope(user, payload.project_ids)
        export = ReportExport(
            user_id=user.id,
            project_ids=payload.project_ids,
            date_from=payload.date_from.isoformat(),
            date_to=payload.date_to.isoformat(),
            format=payload.format.value,
            status="pending",
        )
        await self.exports.add(export)
        await self.session.commit()
        await self.session.refresh(export)

        from app.celery.app import celery_app

        try:
            task = celery_app.send_task(
                "app.celery.tasks.generate_report_export", args=[export.id]
            )
            export.task_id = task.id
        except Exception as exc:  # pragma: no cover - depends on broker state
            export.status = "failed"
            await self.session.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to queue export task",
            ) from exc

        await self.session.commit()
        await self.session.refresh(export)
        return export

    async def _validate_project_scope(
        self, user: User, project_ids: list[int] | None
    ) -> None:
        if not project_ids:
            return
        projects = await self.projects.get_by_ids(project_ids)
        missing = set(project_ids) - set(projects.keys())
        if missing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )
        for project in projects.values():
            if project.owner_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden project access",
                )

    async def list_exports(self, user: User) -> list[ReportExport]:
        return await self.exports.list_by_user(user.id)

    async def get_export(self, user: User, export_id: int) -> ReportExport:
        export = await self.exports.get(export_id)
        if not export or export.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Export not found"
            )
        return export
