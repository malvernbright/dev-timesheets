# Frontend Architecture

## Goals

- Deliver a responsive React client for the Dev Timesheets API with MVP flows: authentication, project + time tracking, reporting, and export downloads.
- Keep the stack lightweight but scalable so future collaboration, reminders, and integration features can be layered in without rewrites.

## Tech Stack

- **Build Tool:** Vite (React + TypeScript template) for fast DX and tree-shakable bundles.
- **UI Layer:** React 18 with React Router v6 for views/pages, Chakra UI for accessible responsive components, and Framer Motion for subtle transitions.
- **State & Data:** React Query for server state (API caching, background refresh), Zustand store for auth/session and lightweight client prefs (layout density, dark mode), and React Context wrappers for feature-level configuration.
- **HTTP Client:** Axios instance with interceptors for JWT injection and automatic refresh requests.
- **Forms & Validation:** React Hook Form + Zod to keep validation rules declarative and reusable.
- **Testing:** Vitest + Testing Library for unit/component tests, MSW-powered API mocks for deterministic data.
- **Linting/Formatting:** ESLint (typescript + react + hooks + testing-library configs) and Prettier.

## Directory Layout (planned)

```
frontend/
  src/
    app/
      providers/       # Global providers such as query client, auth, theme
      routes/          # Route objects + lazy loaded views
    components/        # Shared UI widgets (NavBar, DataTable, EmptyState, etc.)
    features/
      auth/
      projects/
      timeEntries/
      reports/
      reminders/
      integrations/
    hooks/
    services/
      api-client.ts    # Axios instance + helpers
      endpoints.ts     # Typed SDK functions
    store/
      authStore.ts
      preferencesStore.ts
    types/
    utils/
    tests/
      __mocks__/       # MSW handlers
  public/
  vite.config.ts
```

## Core Flows

1. **Authentication**

   - Register/Login pages POST to `/api/auth/register` & `/api/auth/login`.
   - JWT access tokens stored in memory + `localStorage` (encrypted refresh token optional) to rehydrate sessions.
   - Axios response interceptor detects 401, hits `/api/auth/refresh`, retries original request once.

2. **Project & Time Logging**

   - Dashboard shows active projects fetched via `/api/projects`.
   - Time logging form posts to `/api/time-entries` with minutes, project, and date/time range.
   - Lists filter via query params (`?project_id=&date_from=&date_to=`) and leverage React Query caching per filter key.

3. **Reports/Exports**

   - Reports view calls `/api/reports/summary` with filters to render charts/tables.
   - Export form triggers `/api/reports/export` (CSV/PDF). Poll `/api/reports/exports` for job status and expose download links served by backend.

4. **Reminders & Integrations (Phase 2)**
   - Screens scaffolded with list/create forms hitting `/api/reminders` & `/api/integrations` once UX is ready.
   - Reminders flow lets users pick recurrence (cron expression) and channels; backend handles Celery scheduling.

## Responsiveness & Accessibility

- Chakra UI breakpoints (`base`, `sm`, `md`, `lg`, `xl`) ensure grid/list layouts adapt to phone/tablet/desktop widths.
- Use Chakra’s color mode + tokens to guarantee contrast; include skip links and focus management in modal/dialog components.
- Mobile-first navigation: collapsible sidebar, sticky action buttons for time logging.

## Customization & Collaboration Hooks

- Preferences store keeps user-specific UI choices (default project, grouping) persisted in `localStorage` for configurability.
- Future team features (shared reports, approvals) will hook into the same React Query cache with role-based feature flags delivered by the backend `/api/users/me` response.

## Testing Strategy

- Unit test pure utilities (formatting durations, building query params).
- Component tests focus on feature routes (e.g., submit time entry form, inspect React Query mutation state) using MSW handlers to stub backend responses.
- Smoke test the entire router tree via `App.test.tsx` to ensure providers integrate correctly.

## Deployment & Docker

- Development: `npm run dev` served via Vite on port 5173 with proxy to backend (http://localhost:8000).
- Production build: `npm run build` outputs to `frontend/dist`. Dockerfile will build static assets with `node:20` and serve via `nginx:alpine`.
- Compose will gain a `frontend` service to expose port 5173 (dev) and optionally 4173 preview builds, while production deployments can serve static files through the API gateway.

## Environment Configuration

- `.env` with `VITE_API_BASE_URL` defaulting to `http://localhost:8000`.
- Additional flags: `VITE_ENABLE_MSW` (dev testing) and `VITE_DEFAULT_PAGE_SIZE` for listings.

This plan guides the upcoming implementation so the frontend aligns with the backend contract, remains testable, and can expand toward reminders, integrations, and collaboration tooling.
