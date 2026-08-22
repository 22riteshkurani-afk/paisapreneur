# Paisapreneur Architecture Audit

## Executive summary

The repository is in a transitional state: the active application is a Flask + React/Vite SaaS prototype, while several historical or experimental folders remain in the repository and should be treated as archived or isolated prototypes rather than active product code.

## Active product surface

- Frontend: `frontend/`
  - React + Vite + Tailwind
  - App shell, routes, auth, dashboard, career modules, API layer
- Backend: `backend/`
  - Flask app and auth APIs
  - SQLAlchemy models and DB initialization
  - Protected routes and module persistence
- Shared product docs: root docs and README files

## Findings

### 1) Active application is clear and coherent

The primary app is centered around:

- `frontend/src/main.jsx` and `frontend/src/App.jsx`
- `frontend/src/contexts/AuthContext.jsx`
- `backend/app.py`
- `backend/auth/routes.py`
- `backend/models.py`

This is the current product runtime.

### 2) Legacy and prototype code remains in the repo

These folders/files are not core product paths and should be clearly treated as archived or experimental:

- `old_fastapi/` — legacy FastAPI prototype and older tests
- `content-generator-agent/` — standalone AI prototype, not part of app runtime
- `agent.py` — likely an experimental or ad hoc script
- `main.py` — top-level script, not the app entrypoint
- `test_output*.txt` — generated artifacts, not source
- `package-lock.json` at repo root — stale artifact, not used by app runtime

### 3) Duplication and drift

The codebase contains both:

- modern Flask app flow under `backend/`
- older FastAPI references in `old_fastapi/` and documentation

This creates confusion during onboarding and deployment. The system should standardize on one runtime architecture: Flask for the app backend, React/Vite for the frontend.

### 4) Feature distribution is mostly good, but not yet organized by domain

The product contains the intended feature set, but the app is still organized by generic route and page files instead of domain ownership. For a scalable SaaS, the next step is to group features around business domains:

- `auth/`
- `dashboard/`
- `profile/`
- `resume/`
- `interview/`
- `jobs/`
- `passport/`
- `business/`
- `admin/`
- `billing/`
- `analytics/`
- `notifications/`

### 5) Production quality is uneven across modules

The app already includes the right product direction, but several modules still need stronger design consistency:

- centralized feature state management
- reusable domain components
- consistent loading/error patterns
- module-level API wrappers and service boundaries
- hidden or undeclared dependencies between pages/slices

## Refactor recommendation

1. Keep `backend/` as the active server runtime.
2. Keep `frontend/` as the active UI runtime.
3. Move all legacy or experimental code under `archive/` or clearly label it as prototype-only.
4. Organize frontend by feature domain, not by ad-hoc page names alone.
5. Standardize service boundaries and API contracts for each feature.
6. Complete Phase 1 before continuing to Phase 2.

## Cleanup actions

- archive `old_fastapi/`
- archive `content-generator-agent/`
- remove stale root generated files if they are not intentionally tracked
- ensure the runtime app is driven by `frontend/package.json` and `backend/app.py`
- create milestone-based commits for each phase of execution
