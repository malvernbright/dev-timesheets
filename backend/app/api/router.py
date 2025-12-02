from fastapi import APIRouter

from app.api import (
    auth,
    projects,
    time_entries,
    reports,
    reminders,
    integrations,
    health,
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(
    time_entries.router, prefix="/time-entries", tags=["time-entries"]
)
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
api_router.include_router(
    integrations.router, prefix="/integrations", tags=["integrations"]
)
