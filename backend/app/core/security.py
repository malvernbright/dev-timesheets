from datetime import datetime, timedelta
from typing import Any

from argon2 import PasswordHasher
from fastapi.security import OAuth2PasswordBearer
from jose import jwt

from app.core.config import get_settings

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/login")
_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        _password_hasher.verify(hashed_password, password)
        return True
    except Exception:  # pragma: no cover - argon2 exceptions collapse here
        return False


def create_token(subject: Any, expires_delta: timedelta, token_type: str) -> str:
    payload = {
        "sub": str(subject),
        "exp": datetime.utcnow() + expires_delta,
        "type": token_type,
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def create_access_token(subject: Any) -> str:
    return create_token(subject, timedelta(minutes=settings.access_token_expire_minutes), "access")


def create_refresh_token(subject: Any) -> str:
    return create_token(subject, timedelta(minutes=settings.refresh_token_expire_minutes), "refresh")
