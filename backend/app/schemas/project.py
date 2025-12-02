from datetime import datetime

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    color: str | None = Field(default=None, max_length=16)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    color: str | None = Field(default=None, max_length=16)
    is_archived: bool | None = None


class ProjectRead(ProjectBase):
    id: int
    is_archived: bool
    created_at: datetime

    class Config:
        from_attributes = True
