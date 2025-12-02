from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, Token

settings = get_settings()


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.users = UserRepository(session)

    @staticmethod
    def _normalize_email(email: str) -> str:
        return email.strip().lower()

    async def register(self, data: RegisterRequest) -> User:
        normalized_email = self._normalize_email(data.email)
        existing = await self.users.get_by_email(normalized_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )
        user = User(
            email=normalized_email,
            full_name=data.full_name,
            timezone=data.timezone,
            hashed_password=hash_password(data.password),
        )
        await self.users.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def login(self, data: LoginRequest) -> Token:
        normalized_email = self._normalize_email(data.email)
        user = await self.users.get_by_email(normalized_email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
            )
        return Token(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )

    async def refresh(self, data: RefreshRequest) -> Token:
        try:
            payload = jwt.decode(
                data.refresh_token, settings.secret_key, algorithms=["HS256"]
            )
        except JWTError as exc:  # pragma: no cover - depends on token input
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            ) from exc

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )

        user = await self.users.get(int(payload["sub"]))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user"
            )

        return Token(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )
