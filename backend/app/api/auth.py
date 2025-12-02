from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session, get_current_user
from app.models import User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, Token
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=Token, status_code=201)
async def register_user(
    payload: RegisterRequest, session: AsyncSession = Depends(get_async_session)
) -> Token:
    service = AuthService(session)
    await service.register(payload)
    return await service.login(
        LoginRequest(email=payload.email, password=payload.password)
    )


@router.post("/login", response_model=Token)
async def login(
    payload: LoginRequest, session: AsyncSession = Depends(get_async_session)
) -> Token:
    service = AuthService(session)
    return await service.login(payload)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    payload: RefreshRequest, session: AsyncSession = Depends(get_async_session)
) -> Token:
    service = AuthService(session)
    return await service.refresh(payload)


@router.get("/me", response_model=UserRead)
async def get_profile(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)
