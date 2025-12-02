import pytest


@pytest.mark.anyio
async def test_health_ping(test_client):
    response = await test_client.get("/api/health/ping")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
