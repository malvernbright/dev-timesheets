from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import oauth2_scheme
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenPayload

settings = get_settings()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db():
        yield session


async def get_current_user(
    session: AsyncSession = Depends(get_async_session),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
    except (JWTError, ValueError):
        raise credentials_exception from None

    repo = UserRepository(session)
    user = await repo.get(token_data.sub)
    if token_data.type != "access":
        raise credentials_exception
    if not user or not user.is_active:
        raise credentials_exception
    return user
