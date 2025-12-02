from datetime import date

from pydantic import BaseModel, Field, model_validator

from app.models.report import ExportFormat


class ReportFilters(BaseModel):
    project_ids: list[int] | None = None
    date_from: date
    date_to: date

    @model_validator(mode="after")
    def validate_date_range(self) -> "ReportFilters":
        if self.date_from > self.date_to:
            raise ValueError("date_from must be before date_to")
        return self


class ReportSummary(BaseModel):
    project_id: int
    project_name: str
    total_minutes: int
    total_billable_minutes: int


class ReportResponse(BaseModel):
    summary: list[ReportSummary]
    total_minutes: int
    total_billable_minutes: int


class ExportRequest(ReportFilters):
    format: ExportFormat = Field(default=ExportFormat.CSV)


class ExportRead(BaseModel):
    id: int
    format: ExportFormat
    status: str
    file_path: str | None = None

    class Config:
        from_attributes = True
