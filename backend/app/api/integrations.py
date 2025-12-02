from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session, get_current_user
from app.models import User
from app.schemas.integration import IntegrationCreate, IntegrationRead
from app.services.integration_service import IntegrationService

router = APIRouter()


@router.get("/", response_model=list[IntegrationRead])
async def list_integrations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[IntegrationRead]:
    service = IntegrationService(session)
    tokens = await service.list_tokens(current_user)
    return [IntegrationRead.model_validate(token) for token in tokens]


@router.post("/", response_model=IntegrationRead, status_code=status.HTTP_201_CREATED)
async def upsert_integration(
    payload: IntegrationCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> IntegrationRead:
    service = IntegrationService(session)
    token = await service.upsert_token(current_user, payload)
    return IntegrationRead.model_validate(token)
