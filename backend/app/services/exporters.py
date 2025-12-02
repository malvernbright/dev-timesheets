from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph

from app.schemas.report import ReportResponse

EXPORT_DIR = Path("storage/exports")
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def export_to_csv(report: ReportResponse, filename: str) -> str:
    path = EXPORT_DIR / filename
    lines = ["project_id,project_name,total_minutes,total_billable_minutes"]
    for row in report.summary:
        lines.append(
            f"{row.project_id},{row.project_name},{row.total_minutes},{row.total_billable_minutes}"
        )
    lines.append(f"TOTAL,,{report.total_minutes},{report.total_billable_minutes}")
    path.write_text("\n".join(lines), encoding="utf-8")
    return str(path)


def export_to_pdf(report: ReportResponse, filename: str) -> str:
    path = EXPORT_DIR / filename
    doc = SimpleDocTemplate(str(path), pagesize=letter)
    styles = getSampleStyleSheet()
    elements = [Paragraph("Time Report", styles["Heading1"])]
    data = [["Project", "Total Minutes", "Billable Minutes"]]
    for row in report.summary:
        data.append([row.project_name, row.total_minutes, row.total_billable_minutes])
    data.append(["Total", report.total_minutes, report.total_billable_minutes])
    table = Table(data)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ]
        )
    )
    elements.append(table)
    doc.build(elements)
    return str(path)
