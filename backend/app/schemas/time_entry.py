from datetime import datetime

from pydantic import BaseModel, Field


class TimeEntryBase(BaseModel):
    project_id: int
    description: str | None = Field(default=None, max_length=1024)
    started_at: datetime
    ended_at: datetime | None = None
    duration_minutes: int = Field(gt=0)
    is_billable: bool = True
    hourly_rate: float | None = Field(default=None, ge=0)


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryUpdate(BaseModel):
    project_id: int | None = None
    description: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    is_billable: bool | None = None
    hourly_rate: float | None = Field(default=None, ge=0)


class TimeEntryRead(TimeEntryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
