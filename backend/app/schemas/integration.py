from pydantic import BaseModel, Field


class IntegrationCreate(BaseModel):
    provider: str = Field(min_length=2, max_length=64)
    access_token: str = Field(min_length=1)
    details: str | None = Field(default=None, max_length=1024)


class IntegrationRead(BaseModel):
    id: int
    provider: str
    details: str | None = None

    class Config:
        from_attributes = True
