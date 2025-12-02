from pydantic import BaseModel, Field


class ReminderBase(BaseModel):
    label: str = Field(min_length=1, max_length=255)
    cron_expression: str = Field(min_length=5, max_length=64)
    channel: str = Field(default="email", max_length=32)
    is_active: bool = True


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    label: str | None = None
    cron_expression: str | None = None
    channel: str | None = None
    is_active: bool | None = None


class ReminderRead(ReminderBase):
    id: int

    class Config:
        from_attributes = True
