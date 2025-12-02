from datetime import date, datetime, timedelta

import pytest

from tests.helpers import auth_headers


@pytest.mark.anyio
async def test_report_summary_and_export(test_client):
    headers = await auth_headers(test_client, "reports@example.com")

    project = await test_client.post(
        "/api/projects/",
        headers=headers,
        json={"name": "Reporting", "description": "Metrics"},
    )
    project_id = project.json()["id"]

    now = datetime.utcnow()
    for minutes in (30, 45):
        await test_client.post(
            "/api/time-entries/",
            headers=headers,
            json={
                "project_id": project_id,
                "description": "Work",
                "started_at": now.isoformat(),
                "ended_at": (now + timedelta(minutes=minutes)).isoformat(),
                "duration_minutes": minutes,
                "is_billable": True,
            },
        )

    summary = await test_client.post(
        "/api/reports/summary",
        headers=headers,
        json={
            "project_ids": [project_id],
            "date_from": (date.today() - timedelta(days=1)).isoformat(),
            "date_to": (date.today() + timedelta(days=1)).isoformat(),
        },
    )
    assert summary.status_code == 200
    payload = summary.json()
    assert payload["total_minutes"] == 75
    assert payload["total_billable_minutes"] == 75
    assert payload["summary"][0]["project_id"] == project_id

    export = await test_client.post(
        "/api/reports/export",
        headers=headers,
        json={
            "project_ids": [project_id],
            "date_from": (date.today() - timedelta(days=1)).isoformat(),
            "date_to": (date.today() + timedelta(days=1)).isoformat(),
            "format": "csv",
        },
    )
    assert export.status_code == 202
    assert export.json()["status"] in {"pending", "completed"}
