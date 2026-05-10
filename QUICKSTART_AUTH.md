# Paisapreneur Auth System - Quick Start

## ⚡ 5-Minute Local Setup

### **1. Install Dependencies**

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd ../frontend
npm install
```

### **2. Get Google OAuth Client ID**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project "Paisapreneur"
3. Go to **APIs & Services > Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add origins: `http://localhost:5173`, `http://localhost:8000`
6. Copy the **Client ID**

### **3. Configure Environment**

**Backend** (`backend/.env`):
```
FLASK_ENV=development
FLASK_DEBUG=1
JWT_SECRET_KEY=dev-secret-key-change-in-production-32-chars-min
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
```

**Frontend** (`frontend/.env.local`):
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_API_URL=http://localhost:8000
```

### **4. Run Local Servers**

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
# Server: http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

### **5. Test Auth Flow**

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Complete Google login
4. Fill onboarding form
5. Access dashboard

---

## 📁 What Changed

### **New Files Created**

```
backend/auth/
├── __init__.py
├── routes.py          (Google login, token refresh, logout)
├── decorators.py      (@jwt_required decorator)
└── utils.py           (Token generation, OAuth verification)

frontend/src/
├── contexts/AuthContext.jsx    (Auth state management)
├── hooks/useAuth.js            (useAuth hook)
├── components/Login.jsx        (Premium Google login UI)
└── components/ProtectedRoute.jsx (Route protection)

.env.example files for both backend and frontend
```

### **Files Modified**

- `backend/models.py` - Enhanced User model with OAuth fields
- `backend/app.py` - Added JWT config, auth blueprint registration
- `backend/requirements.txt` - Added JWT, Google OAuth libraries
- `frontend/package.json` - Added react-router-dom
- `frontend/src/main.jsx` - Added Router and AuthProvider
- `frontend/src/App.jsx` - Integrated auth, added logout

---

## 🔑 Key Features Implemented

✅ **Google OAuth Passwordless Login**
- One-click sign-in with Google
- Premium dark UI matching Paisapreneur branding
- Smooth loading states

✅ **JWT Token System**
- 15-min access tokens (short-lived)
- 7-day refresh tokens (long-lived)
- Automatic token refresh on expiry

✅ **Protected Routes**
- `ProtectedRoute` component guards dashboard
- Unauthenticated users redirected to login
- Private API endpoints require valid JWT

✅ **Auth Context**
- Global auth state (user, token, loading, error)
- Auto-logout on token expiry
- Login/logout functions available everywhere

✅ **Onboarding Integration**
- Auto-redirect to onboarding if `onboarding_completed` is false
- Save profile after onboarding
- Mark onboarding complete in auth system

✅ **Production Security**
- No token in localStorage (only memory)
- HTTPS-ready with Talisman
- CORS hardened to specific origins
- SQL injection prevention (SQLAlchemy)

---

## 🚀 API Endpoints Ready

### **Auth Endpoints (Public/Protected)**

```
POST   /api/auth/google                  # Login with Google
GET    /api/auth/me                      # Get current user (protected)
POST   /api/auth/refresh                 # Refresh access token (protected)
POST   /api/auth/logout                  # Logout (protected)
GET    /api/auth/onboarding-status       # Check onboarding status (protected)
POST   /api/auth/complete-onboarding     # Mark onboarding complete (protected)
```

### **Existing Founder Endpoints (Now Protected with JWT)**

```
GET    /api/founder/dashboard?email=...  # Get dashboard
POST   /api/founder/profile              # Save profile
GET    /api/founder/ventures             # Get ventures
POST   /api/founder/ventures             # Create venture
GET    /api/founder/journal              # Get journal entries
POST   /api/founder/journal              # Create journal entry
GET    /api/founder/tasks                # Get daily tasks
POST   /api/founder/task/toggle          # Toggle task completion
```

---

## 🧪 Testing Auth

### **1. Test Login Flow**

```bash
# Start frontend and click login
# Watch browser console for token storage
# Verify redirect to onboarding
```

### **2. Test Protected Routes**

```bash
# Try accessing http://localhost:5173 without login
# Should redirect to /login
# After login, should show dashboard
```

### **3. Test Token Expiry**

```bash
# Login successfully
# Wait 15 minutes (or set shorter token expiry in .env)
# Make API request
# Should automatically refresh token
# If refresh fails, redirect to login
```

### **4. Test Logout**

```bash
# Click logout button on dashboard navbar
# Tokens should clear
# Redirect to login page
# Accessing / redirects to login
```

---

## 📊 Database Schema Update

### **New User Table Fields**

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(256) UNIQUE NOT NULL,
    full_name VARCHAR(256),
    avatar_url VARCHAR(512),
    provider VARCHAR(64) DEFAULT 'google',
    provider_id VARCHAR(256) UNIQUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(64) DEFAULT 'free',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Configuration Reference

### **JWT Settings (backend/.env)**

```
JWT_SECRET_KEY=your-super-secret-key        # Min 32 chars
JWT_ACCESS_TOKEN_EXPIRES=900                # 15 minutes (seconds)
JWT_REFRESH_TOKEN_EXPIRES=604800            # 7 days (seconds)
```

### **Google OAuth Settings**

```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

Required scopes (automatic): `openid`, `email`, `profile`

### **CORS Settings**

```
CORS_ORIGINS=http://localhost:5173,http://localhost:8000,https://paisapreneur.com
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invalid Google token" | Wrong Client ID | Check GOOGLE_CLIENT_ID in .env |
| "CORS error" | Wrong origin | Add your domain to CORS_ORIGINS |
| "Token expired" | Auto-refresh failed | Check refresh_token in localStorage |
| "Unauthorized" on API | No JWT token | Login first, check Authorization header |
| "401 Unauthorized" | Invalid JWT | JWT may have expired, try logout & login |

---

## 📦 Production Deployment

For Render deployment:

1. **Set backend environment variables** in Render dashboard
2. **Connect PostgreSQL** database
3. **Set frontend environment** in deployment platform (Vercel/Netlify)
4. **Update CORS_ORIGINS** to production domain
5. **Verify Google OAuth** authorized origins updated
6. **Test login flow** on production domain

See `DEPLOYMENT_AUTH.md` for detailed instructions.

---

## 🎯 Next Features in Roadmap

Phase 2 (Ready to build after auth works):
- [ ] AI Founder Advisor (OpenAI integration)
- [ ] AI Roadmap Generator
- [ ] Razorpay subscription integration
- [ ] Daily AI planning system
- [ ] Founder analytics engine
- [ ] Habit tracking enhancements

---

## ✅ Validation Checklist

- [ ] Google OAuth Client ID obtained
- [ ] .env files created in both backend and frontend
- [ ] Dependencies installed
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Login flow works end-to-end
- [ ] Onboarding form displays after login
- [ ] Dashboard loads after onboarding
- [ ] Logout clears tokens
- [ ] Protected routes redirect to login
- [ ] Token refresh works automatically
- [ ] API calls include JWT header

---

**Status: Ready for Production! 🚀**

Questions? Check `DEPLOYMENT_AUTH.md` or terminal logs with `--debug` flag.
