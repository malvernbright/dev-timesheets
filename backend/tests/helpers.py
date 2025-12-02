from __future__ import annotations

from httpx import AsyncClient


async def register_user(
    client: AsyncClient, email: str, password: str = "password123"
) -> None:
    response = await client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Test User"},
    )
    response.raise_for_status()


async def login_user(
    client: AsyncClient, email: str, password: str = "password123"
) -> str:
    response = await client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    response.raise_for_status()
    return response.json()["access_token"]


async def auth_headers(client: AsyncClient, email: str) -> dict[str, str]:
    await register_user(client, email)
    token = await login_user(client, email)
    return {"Authorization": f"Bearer {token}"}
