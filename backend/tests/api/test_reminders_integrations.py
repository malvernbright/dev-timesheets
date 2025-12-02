import pytest

from tests.helpers import auth_headers


@pytest.mark.anyio
async def test_reminder_crud_and_integrations(test_client):
    headers = await auth_headers(test_client, "reminders@example.com")

    reminder_payload = {
        "label": "Log time",
        "cron_expression": "0 9 * * 1-5",
        "channel": "email",
    }
    reminder_response = await test_client.post(
        "/api/reminders/", headers=headers, json=reminder_payload
    )
    assert reminder_response.status_code == 201
    reminder_id = reminder_response.json()["id"]

    list_response = await test_client.get("/api/reminders/", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    update_response = await test_client.patch(
        f"/api/reminders/{reminder_id}",
        headers=headers,
        json={"is_active": False},
    )
    assert update_response.status_code == 200
    assert update_response.json()["is_active"] is False

    delete_response = await test_client.delete(
        f"/api/reminders/{reminder_id}", headers=headers
    )
    assert delete_response.status_code == 204

    integration_response = await test_client.post(
        "/api/integrations/",
        headers=headers,
        json={"provider": "jira", "access_token": "token-123"},
    )
    assert integration_response.status_code == 201
    assert integration_response.json()["provider"] == "jira"

    integrations_list = await test_client.get("/api/integrations/", headers=headers)
    assert len(integrations_list.json()) == 1
