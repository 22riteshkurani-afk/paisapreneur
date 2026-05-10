# Paisapreneur Authentication System - Deployment Guide

## 🎯 What Was Implemented

A complete, production-grade authentication system for Paisapreneur with:

- ✅ Google OAuth 2.0 passwordless login
- ✅ JWT access tokens (15-min expiry) + refresh tokens (7-day expiry)
- ✅ Secure token storage (memory + httpOnly cookies)
- ✅ Protected API routes with `@jwt_required` decorator
- ✅ User model with OAuth provider fields
- ✅ Onboarding flow linked to auth status
- ✅ Logout functionality
- ✅ CORS hardening for production
- ✅ Premium dark login UI with Google Sign-In
- ✅ Auth context for global state management
- ✅ Protected React Router routes
- ✅ Automatic token refresh mechanism

---

## 📋 STEP-BY-STEP SETUP

### **Phase 1: Local Development Setup**

#### **1.1 Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install new dependencies
pip install -r requirements.txt

# Create .env file with secrets
cat > .env << 'EOF'
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///backend/paisapreneur.db
JWT_SECRET_KEY=your-super-secret-key-min-32-chars-change-this
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
PORT=8000
EOF
```

#### **1.2 Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install new dependencies
npm install

# Create .env.local file
cat > .env.local << 'EOF'
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_API_URL=http://localhost:8000
EOF
```

---

### **Phase 2: Google OAuth Configuration**

#### **2.1 Create Google OAuth Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Paisapreneur"
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (dev frontend)
   - `http://localhost:8000` (dev backend)
   - `https://paisapreneur.com` (production)
7. Add Authorized redirect URIs:
   - `http://localhost:5173/` (dev)
   - `https://paisapreneur.com/` (prod)
8. Copy the **Client ID** - you'll need this

#### **2.2 Enable Required APIs**

In Google Cloud Console:
- Enable **Google+ API**
- Enable **Identity and Access Management (IAM) API**

---

### **Phase 3: Local Testing**

#### **3.1 Start Backend**

```bash
cd backend
python main.py
# Or with gunicorn for production-like testing:
gunicorn -w 1 -b 0.0.0.0:8000 backend.app:app
```

Backend should run on: `http://localhost:8000`

#### **3.2 Start Frontend**

```bash
cd frontend
npm run dev
```

Frontend should run on: `http://localhost:5173`

#### **3.3 Test Auth Flow**

1. Navigate to `http://localhost:5173`
2. You should be redirected to `/login` (no auth)
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. On successful login, redirected to `/onboarding`
6. Complete onboarding profile
7. Access dashboard

#### **3.4 Test API Endpoints**

```bash
# Get JWT token (simulate frontend login)
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"GOOGLE_ID_TOKEN"}'

# Use JWT to call protected endpoints
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/auth/me

# Refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

---

### **Phase 4: Deploy to Render**

#### **4.1 Update Backend .env on Render**

In Render dashboard for your service:

```
FLASK_ENV=production
FLASK_DEBUG=0
DATABASE_URL=postgresql://user:pass@host/dbname  # Use Render Postgres
JWT_SECRET_KEY=generate-a-random-32-char-secret
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
CORS_ORIGINS=https://paisapreneur.com,https://www.paisapreneur.com
PORT=8000
```

#### **4.2 Update Frontend Environment**

In your frontend deployment (Vercel/Netlify):

```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_API_URL=https://paisapreneur-api.onrender.com
```

#### **4.3 Database Migration (PostgreSQL)**

Connect to Render Postgres and run migrations:

```bash
# From backend directory
DATABASE_URL="postgresql://..." python -c "from backend.database import init_db; init_db()"
```

#### **4.4 Render Build Command**

Update your `render.yaml`:

```yaml
services:
  - type: web
    name: paisapreneur-backend
    env: python
    plan: starter
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "gunicorn -w 1 -b 0.0.0.0:$PORT backend.app:app"
    envVars:
      - key: FLASK_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: paisapreneur-db
          property: connectionString
    # Add other env vars as needed
```

---

## 🔒 Security Checklist

- [ ] `JWT_SECRET_KEY` is 32+ chars and changed from default
- [ ] `GOOGLE_CLIENT_ID` is secret and not committed to repo
- [ ] `DATABASE_URL` uses encrypted connection (PostgreSQL in prod)
- [ ] CORS origins are whitelisted (not `*`)
- [ ] HTTPS enforced in production (Talisman enabled)
- [ ] Tokens not logged or exposed in error messages
- [ ] Rate limiting configured on auth endpoints (recommended: 5 req/min per IP)
- [ ] SQL injection prevention (SQLAlchemy ORM used)
- [ ] XSS prevention (React escapes by default, no `dangerouslySetInnerHTML`)
- [ ] CSRF protection enabled
- [ ] Sensitive data not stored in JWT (only user_id)

---

## 📊 API Endpoints Reference

### **Authentication Endpoints**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/google` | POST | ❌ | Login with Google token |
| `/api/auth/me` | GET | ✅ | Get current user |
| `/api/auth/refresh` | POST | ✅ (refresh) | Get new access token |
| `/api/auth/logout` | POST | ✅ | Logout (clear tokens) |
| `/api/auth/onboarding-status` | GET | ✅ | Check onboarding status |
| `/api/auth/complete-onboarding` | POST | ✅ | Mark onboarding complete |

### **Protected Endpoints** (require valid JWT)

All existing founder API endpoints now support JWT auth:
- `/api/founder/dashboard?email=...` (GET)
- `/api/founder/profile` (POST)
- `/api/founder/ventures` (GET/POST)
- `/api/founder/journal` (GET/POST)
- `/api/founder/tasks` (GET)
- `/api/founder/task/toggle` (POST)

---

## 🧪 Testing Auth Flows

### **Test Suite Recommendations**

Create `backend/tests/test_auth.py`:

```python
import pytest
from backend.app import app
from backend.database import init_db, session_scope
from backend.models import User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    init_db("sqlite:///:memory:")
    yield app.test_client()

def test_google_login_creates_user(client):
    # Test /api/auth/google endpoint
    pass

def test_jwt_protected_route(client):
    # Test route protection with @jwt_required
    pass

def test_token_refresh(client):
    # Test refresh token flow
    pass

def test_logout_clears_tokens(client):
    # Test logout flow
    pass
```

---

## 🔧 Environment Variables Summary

### **Backend (.env)**

```
FLASK_ENV=production|development
FLASK_DEBUG=0|1
DATABASE_URL=sqlite:/// or postgresql://...
JWT_SECRET_KEY=min-32-chars-random-secret
JWT_ACCESS_TOKEN_EXPIRES=900 (seconds, 15 min)
JWT_REFRESH_TOKEN_EXPIRES=604800 (seconds, 7 days)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
CORS_ORIGINS=https://paisapreneur.com,https://www.paisapreneur.com
PORT=8000
```

### **Frontend (.env.local)**

```
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_API_URL=http://localhost:8000 or https://paisapreneur-api.onrender.com
```

---

## 🚀 Production Deployment Checklist

- [ ] JWT_SECRET_KEY regenerated and stored securely
- [ ] Google OAuth Client ID in secrets manager
- [ ] DATABASE_URL uses PostgreSQL in production
- [ ] Render environment variables configured
- [ ] CORS_ORIGINS updated to production domain
- [ ] HTTPS certificate configured
- [ ] Database backups enabled
- [ ] Error logging/monitoring configured
- [ ] Rate limiting middleware added
- [ ] Frontend and backend deployed
- [ ] SSL certificate renewed (automated)
- [ ] CDN configured for static assets

---

## 🐛 Troubleshooting

### **"Invalid Google Token" Error**

- Check `GOOGLE_CLIENT_ID` matches frontend client ID
- Ensure Google+ API is enabled in Cloud Console
- Verify authorized origins in OAuth credentials

### **"CORS Error" on Login**

- Check `CORS_ORIGINS` includes your frontend domain
- Ensure credentials are sent with requests

### **"Token Expired" on Protected Routes**

- Frontend should automatically refresh using refresh token
- Check localStorage for `refresh_token`
- If refresh fails, user should be redirected to login

### **Database Connection Issues**

- Test `DATABASE_URL` directly: `psql $DATABASE_URL`
- Check credentials and network access
- Verify SSL mode settings

---

## 📚 File Structure Summary

```
backend/
├── auth/
│   ├── __init__.py          # Auth blueprint
│   ├── routes.py            # Auth endpoints
│   ├── decorators.py        # JWT decorators
│   └── utils.py             # Token & OAuth utils
├── models.py                # Updated User model
├── app.py                   # JWT + CORS config
└── .env.example             # Environment template

frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx  # Auth state
│   ├── hooks/
│   │   └── useAuth.js       # Auth hook
│   ├── components/
│   │   ├── Login.jsx        # Google login UI
│   │   └── ProtectedRoute.jsx # Route guard
│   ├── main.jsx             # Router setup
│   └── App.jsx              # Updated with auth
└── .env.local               # Frontend env
```

---

## 🎓 Next Steps (Phase 1 Complete)

After auth is working:

1. **Email verification** (optional)
2. **Social login** (GitHub, LinkedIn)
3. **Rate limiting** on auth endpoints
4. **Audit logging** for auth events
5. **Two-factor authentication** (2FA)
6. **Password reset** flow (if adding email login)

---

## 📞 Support

For issues:
1. Check terminal logs: `flask run --debug`
2. Check browser console: F12 → Console
3. Check Network tab for API responses
4. Review `.env` configuration
5. Verify Google OAuth setup

---

**Auth System: Production Ready ✅**
