# Backend Architecture Plan

## Tech Overview
- **Framework:** FastAPI with Pydantic models and dependency injection.
- **Database:** PostgreSQL accessed through SQLAlchemy 2.x ORM and Alembic for migrations.
- **Authentication:** JWT tokens (access + refresh) issued via OAuth2 password flow. Passwords stored using Argon2id hashes.
- **Background Jobs:** Celery workers with Redis broker + result backend to deliver reminder notifications and scheduled exports.
- **File Exports:** CSV built via Python's `csv` module; PDF created with ReportLab.
- **Testing:** Pytest with HTTPX AsyncClient fixtures and factory helpers for DB objects.
- **Configuration:** Pydantic `BaseSettings` pulling from environment variables and `.env` for local use.
- **Packaging:** Poetry to manage dependencies and scripts.

## Service Modules
- `app/core`: configuration, logging, security (JWT helpers, password hashing), and exception handling.
- `app/models`: SQLAlchemy ORM models (User, Project, TimeEntry, ReportRequest, Reminder, IntegrationToken).
- `app/schemas`: Pydantic request/response models mirroring domain entities with validation.
- `app/api`: FastAPI routers grouped by domain (auth, projects, time-entries, reports, reminders, integrations, health).
- `app/services`: business logic orchestrating repositories, third-party integrations, exports, and Celery tasks.
- `app/repositories`: database CRUD utilities per aggregate with transactional helpers.
- `app/celery`: Celery app instance, periodic task definitions, and reminder/export task implementations.

## Key Flows
1. **User Auth**
   - Sign up -> verify email optional (out of scope MVP) -> login -> get JWTs.
   - Protected routes depend on `get_current_user` from JWT access token.

2. **Time Logging**
   - Projects defined per user/team. Time entries store project_id, description, start/end or duration, billable flag.
   - Bulk import/export support later; MVP handles CRUD and pagination.

3. **Reporting**
   - Reports requested via filters (project(s), members, date range). Service aggregates durations per project/day.
   - Export endpoints trigger Celery tasks to create CSV/PDF; results stored as signed URLs/local file paths for download.

4. **Reminders**
   - Users configure reminder rules (frequency, channel). Celery beat schedules tasks; tasks push notifications via email/webhook placeholder.

5. **Integrations**
   - Pluggable connectors for PM tools (placeholder classes). Store OAuth/API tokens securely.

## Scalability & Security Considerations
- Database migrations versioned via Alembic; indexes on foreign keys + (user_id, date) combos.
- Settings support multi-environment deployments; Docker Compose for dev, containers for prod (API, worker, beat, Postgres, Redis).
- JWT best practices: short-lived access tokens, refresh rotation, revoked token cache in Redis (stretch goal).
- Input validation and rate limiting (future). Logging/metrics ready via middleware hooks.

## Immediate Deliverables (Backend MVP)
1. Project scaffolding with FastAPI, Alembic, Poetry, Docker.
2. Core models/schemas for users, projects, time entries.
3. Auth + time entry endpoints with tests.
4. Report generation service returning JSON plus CSV/PDF exports.
5. Celery reminder scheduling stub with tests.
6. Documentation covering setup, running, and testing.
