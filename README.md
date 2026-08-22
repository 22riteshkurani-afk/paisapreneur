# Paisapreneur

## Stack
- Frontend: React + Tailwind CSS + Framer Motion
- Backend: Flask + SQLAlchemy
- Database: SQLite by default, PostgreSQL via `DATABASE_URL`, and Supabase-ready migrations
- Hosting: Render-compatible Docker deployment with Vercel frontend support

## Project layout
- `frontend/` — Vite-based React app
- `backend/` — Flask API and database layer
- `supabase/` — Supabase migrations and RLS setup
- `old_fastapi/` — archived FastAPI files
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

## Environment
- `VITE_API_URL` — frontend API base URL
- `VITE_GEMINI_API` — Gemini key exposed to the client
- `GEMINI_API_KEY` — server-side Gemini key
- `JWT_SECRET_KEY` — strong secret for JWT signing
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon key
- `RAZORPAY_KEY_ID` — Razorpay public key
- `RAZORPAY_SECRET` — Razorpay secret
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `DATABASE_URL` — PostgreSQL URL for production

## Supabase
Run the migration in `supabase/migrations/001_init.sql` to create the production tables and RLS policies.

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: Supabase

## CI/CD
Use GitHub Actions to run the frontend build and backend tests on every push to main.
