import pytest

from tests.helpers import login_user, register_user


@pytest.mark.anyio
async def test_register_login_and_profile(test_client):
    email = "auth@example.com"
    await register_user(test_client, email)

    access_token = await login_user(test_client, email)
    assert access_token

    response = await test_client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == email


@pytest.mark.anyio
async def test_duplicate_registration_fails(test_client):
    email = "duplicate@example.com"
    await register_user(test_client, email)
    response = await test_client.post(
        "/api/auth/register",
        json={"email": email, "password": "password123"},
    )
    assert response.status_code == 400
    assert "already" in response.json()["detail"]
