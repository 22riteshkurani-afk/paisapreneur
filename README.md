# Paisapreneur

## Stack
- Frontend: React + Tailwind CSS + Framer Motion
- Backend: Flask + SQLAlchemy
- Database: SQLite by default, PostgreSQL via `DATABASE_URL` later
- Hosting: Render-compatible Docker deployment

## Project layout
- `frontend/` — Vite-based React app
- `backend/` — Flask API and SQLite-friendly database layer
- `old_fastapi/` — archived FastAPI files (config.py, database.py, models.py, etc.)
- `Dockerfile` — multi-stage build for frontend + backend

## Local development
1. Start Flask backend:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```
2. Start React frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Production build
```bash
cd frontend
npm install
npm run build
cd ..
python -m pip install -r backend/requirements.txt
python backend/app.py
```

## Render
The repository is ready for a Render Docker service. The app uses `Dockerfile` to build the React site and launch Flask.

## Environment
- `DATABASE_URL` — Postgres URL for production
- `SECRET_KEY` — Flask secret key
