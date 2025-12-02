from datetime import datetime, timedelta

import pytest

from tests.helpers import auth_headers


@pytest.mark.anyio
async def test_project_and_time_entry_flow(test_client):
    headers = await auth_headers(test_client, "projects@example.com")

    project_response = await test_client.post(
        "/api/projects/",
        headers=headers,
        json={"name": "Backend Revamp", "description": "API work"},
    )
    assert project_response.status_code == 201
    project_id = project_response.json()["id"]

    time_payload = {
        "project_id": project_id,
        "description": "Feature work",
        "started_at": datetime.utcnow().isoformat(),
        "ended_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        "duration_minutes": 60,
        "is_billable": True,
    }
    entry_response = await test_client.post(
        "/api/time-entries/", headers=headers, json=time_payload
    )
    assert entry_response.status_code == 201

    list_response = await test_client.get("/api/time-entries/", headers=headers)
    assert list_response.status_code == 200
    body = list_response.json()
    assert len(body) == 1
    assert body[0]["project_id"] == project_id
    assert body[0]["duration_minutes"] == 60
