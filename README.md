# Dev Timesheets Platform

Full-stack implementation of a multi-project time tracking system with FastAPI, PostgreSQL, and a React + TypeScript frontend. The backend delivers authentication, project/time logging, reporting with CSV/PDF exports, reminders, and integration token storage. The frontend layers a responsive dashboard, time logging UI, reporting workspace, and lightweight CRUD for reminders/integrations. Everything ships with Celery-powered background jobs, Redis/Postgres containers, automated tests, and Docker images for API + SPA delivery.

## Tech Overview

- **Backend:** FastAPI + SQLAlchemy 2.x + Alembic
- **Database:** PostgreSQL (async via `asyncpg`)
- **Background jobs:** Celery workers + beat scheduler on Redis
- **Auth:** JWT (access + refresh) with Argon2 password hashing
- **Exports:** CSV via stdlib + PDF via ReportLab
- **Task Queue Broker:** Redis 7
- **Frontend:** React 19 + Vite + Chakra UI, React Query, React Hook Form, Zustand
- **Packaging:** Poetry / `pyproject.toml`
- **Containerization:** Docker Compose with API, worker, beat, Postgres, Redis services

## Repo Layout

```
backend/
  app/                # FastAPI application code
  tests/              # Pytest suite (async HTTPX client)
  Dockerfile          # API, worker, beat base image
  requirements.txt    # Runtime dependency pins for Docker builds
  .env.example        # Sample configuration
frontend/
   src/
      app/            # Providers + router
      features/       # Feature folders (auth, projects, reports, etc.)
      services/       # Axios client + typed API helpers
   Dockerfile        # Builds static bundle with nginx
   .env.example      # Frontend env vars (VITE_API_BASE_URL, etc.)
docs/
  backend-architecture.md
   frontend-architecture.md
```

## Local Backend Setup (without Docker)

1. **Install dependencies**

   ```bash
   cd backend
   poetry install
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   # update SECRET_KEY, DATABASE_URL, REDIS_URL if needed
   ```

3. **Apply migrations**

   ```bash
   poetry run alembic upgrade head
   ```

4. **Run services**

   ```bash
   # API
   poetry run uvicorn app.main:app --reload

   # Celery worker (in a new terminal)
   poetry run celery -A app.celery.app:celery_app worker --loglevel=info

   # Celery beat scheduler
   poetry run celery -A app.celery.app:celery_app beat --loglevel=info
   ```

5. **Run tests**
   ```bash
   poetry run pytest
   ```

Exports are written to `backend/storage/exports/`. The directory is bind-mounted in Docker and git-tracked via `.gitkeep` for convenience.

## Frontend Setup (without Docker)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # adjust VITE_API_BASE_URL if the API is running on a different host/port
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Vite serves the SPA on http://localhost:5173 and proxies `/api` calls to the FastAPI backend (configured in `vite.config.ts`).

4. **Run frontend tests and linting**

   ```bash
   npm run test       # Vitest + Testing Library
   npm run lint       # ESLint (TypeScript + React)
   ```

The frontend uses Chakra UI, React Query, React Router v7, Zustand, and MSW-ready test utilities. Architectural notes live in `docs/frontend-architecture.md`.

## Docker & Compose

1. Copy the env file (Docker services load `backend/.env`).
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Start the full stack:
   ```bash
   docker compose up --build
   ```
   - API available at http://localhost:8000 (docs at `/docs`).
   - Frontend SPA available at http://localhost:3000 (served via nginx, talking to the API container).
   - Celery worker & beat share the same image and autoload tasks.
   - Postgres (port 5432) and Redis (port 6379) are exposed for local tooling.

## Key API Capabilities

- **Auth:** `/api/auth/register`, `/login`, `/refresh`, `/me`
- **Projects:** CRUD & archive endpoints under `/api/projects`
- **Time entries:** `/api/time-entries` for CRUD + filtering by project or date range
- **Reports:** `/api/reports/summary` for aggregated minutes, `/api/reports/export` to trigger CSV/PDF background generation, `/api/reports/exports` for history
- **Reminders:** `/api/reminders` to manage cron-like reminders (Celery beat dispatches them every 5 minutes)
- **Integrations:** `/api/integrations` stores API tokens for external tools

All protected routes use JWT access tokens in the `Authorization: Bearer <token>` header.

## Testing Notes

Pytest is configured for async HTTP-level tests (`tests/api/*`). The suite spins up a transient SQLite database via SQLAlchemy’s async engine and covers:

- Auth flows (register/login/profile)
- Project + time entry CRUD
- Report summaries and export enqueueing
- Reminder + integration token CRUD

Run `poetry run pytest` or `docker compose run --rm api pytest` to execute the suite.

## Next Steps

- Build the React/TypeScript frontend targeting this API
- Add richer notification channels for reminders (email/webhooks)
- Wire up actual third-party integrations (Jira, Asana, Google Calendar)
- Extend analytics (billable rates, team views, dashboard widgets)

Backend scaffolding is ready for the frontend milestone and future scaling adjustments.
