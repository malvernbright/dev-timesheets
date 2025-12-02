from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session, get_current_user
from app.models import User
from app.schemas.report import ExportRead, ExportRequest, ReportFilters, ReportResponse
from app.services.report_service import ReportService

router = APIRouter()


@router.post("/summary", response_model=ReportResponse)
async def summarize_reports(
    payload: ReportFilters,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ReportResponse:
    service = ReportService(session)
    return await service.summarize(current_user, payload)


@router.post("/export", response_model=ExportRead, status_code=status.HTTP_202_ACCEPTED)
async def create_export(
    payload: ExportRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ExportRead:
    service = ReportService(session)
    export = await service.request_export(current_user, payload)
    return ExportRead.model_validate(export)


@router.get("/exports", response_model=list[ExportRead])
async def list_exports(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[ExportRead]:
    service = ReportService(session)
    exports = await service.list_exports(current_user)
    return [ExportRead.model_validate(item) for item in exports]


@router.get("/exports/{export_id}", response_model=ExportRead)
async def get_export(
    export_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ExportRead:
    service = ReportService(session)
    export = await service.get_export(current_user, export_id)
    return ExportRead.model_validate(export)
