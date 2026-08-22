# Paisapreneur Auth Architecture & Security Model

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  React App (Vite)                                                     │
│  ├─ AuthProvider (Context)     ← Global auth state                   │
│  ├─ useAuth Hook               ← Access auth anywhere                │
│  ├─ Login Component            ← Google Sign-In button                │
│  ├─ ProtectedRoute             ← Guards dashboard                     │
│  └─ App Component              ← Dashboard/Onboarding                 │
│                                                                       │
│  Local Storage:                                                       │
│  ├─ refresh_token (httpOnly cookie in prod)                          │
│  └─ user (JSON serialized)                                           │
│                                                                       │
│  Memory:                                                              │
│  └─ access_token (never persisted)                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ HTTPS (Talisman enforced)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  CORS Middleware                                                      │
│  └─ Whitelist origins from CORS_ORIGINS env var                      │
│                                                                       │
│  Request Flow:                                                        │
│  1. Extract JWT from Authorization header                            │
│  2. Verify JWT signature and expiry                                  │
│  3. Extract user_id from JWT claims                                  │
│  4. Attach to Flask request context                                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FLASK APPLICATION                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Auth Blueprint                                                       │
│  ├─ POST /api/auth/google                                            │
│  │   └─ Verify Google token → Create/Update User → Generate JWT     │
│  ├─ POST /api/auth/refresh                                           │
│  │   └─ Verify refresh token → Generate new access token             │
│  ├─ POST /api/auth/logout                                            │
│  │   └─ Clear tokens (frontend handles cleanup)                      │
│  ├─ GET  /api/auth/me (@jwt_required)                                │
│  │   └─ Return current user data                                     │
│  └─ POST /api/auth/complete-onboarding (@jwt_required)              │
│      └─ Mark user.onboarding_completed = true                        │
│                                                                       │
│  Protected Founder Endpoints (all @jwt_required)                     │
│  ├─ /api/founder/dashboard                                           │
│  ├─ /api/founder/profile                                             │
│  ├─ /api/founder/ventures                                            │
│  ├─ /api/founder/journal                                             │
│  ├─ /api/founder/tasks                                               │
│  └─ /api/founder/task/toggle                                         │
│                                                                       │
│  Request Validation:                                                  │
│  ├─ @jwt_required ensures valid JWT                                  │
│  ├─ get_jwt_identity() extracts user_id                              │
│  ├─ get_jwt() reads all JWT claims                                   │
│  └─ 401 if missing/invalid/expired                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Users Table                                                          │
│  ├─ id (int, PK)                                                     │
│  ├─ email (str, UNIQUE, INDEXED)                                     │
│  ├─ full_name (str)                                                  │
│  ├─ avatar_url (str)                                                 │
│  ├─ provider (str) = 'google'                                        │
│  ├─ provider_id (str) = Google's subject ID                          │
│  ├─ onboarding_completed (bool) = false initially                    │
│  ├─ subscription_tier (str) = 'free'                                 │
│  ├─ last_login (datetime)                                            │
│  ├─ created_at (datetime)                                            │
│  └─ updated_at (datetime)                                            │
│                                                                       │
│  FounderProfile Table (legacy, linked by email)                      │
│  ├─ email (FK to Users.email)                                        │
│  ├─ name                                                              │
│  ├─ experience                                                        │
│  ├─ interests (JSON)                                                 │
│  └─ ... other profile fields                                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### **Token Strategy**

#### **Access Token (JWT)**
- **Lifetime**: 15 minutes
- **Storage**: Memory (not persisted)
- **Purpose**: Authenticate API requests
- **Claims**: `{user_id, iat, exp, type: 'access'}`
- **Rotation**: Auto-refreshed using refresh token
- **Loss Handling**: User must login again

#### **Refresh Token (JWT)**
- **Lifetime**: 7 days
- **Storage**: httpOnly cookie (production) or localStorage (dev)
- **Purpose**: Get new access token without re-login
- **Claims**: `{user_id, iat, exp, type: 'refresh'}`
- **Security**: Cannot be accessed by JavaScript (httpOnly) in production

### **OAuth Flow**

```
1. USER CLICKS "Sign in with Google"
   ↓
2. Google redirects with ID token (JWT from Google)
   ↓
3. Frontend sends ID token to /api/auth/google
   ↓
4. Backend verifies token with Google's public keys
   ↓
5. Google confirms token is valid and returns user info:
   {
     email: "user@example.com",
     name: "User Name",
     picture: "https://...",
     sub: "google-unique-id"
   }
   ↓
6. Backend looks up user by email or provider_id
   ├─ If exists: Update last_login
   └─ If not: Create new user
   ↓
7. Backend generates access_token + refresh_token
   ↓
8. Frontend receives tokens and stores them:
   ├─ access_token → Memory (not persisted)
   ├─ refresh_token → localStorage/cookie
   ├─ user → localStorage
   ↓
9. Frontend redirects to /onboarding or / (dashboard)
   ↓
10. All subsequent API calls include:
    Authorization: Bearer {access_token}
```

### **Token Refresh Flow**

```
1. API call made with access_token
   ↓
2. Backend receives request
   ├─ If token valid: Process request ✓
   └─ If token expired: Respond with 401
   ↓
3. Frontend receives 401
   ↓
4. Frontend makes POST /api/auth/refresh
   ├─ Includes refresh_token in Authorization header
   ↓
5. Backend verifies refresh_token
   ├─ If valid: Generate new access_token ✓
   ├─ If invalid/expired: Respond with 401
   ↓
6. If refresh successful:
   ├─ Store new access_token in memory
   ├─ Retry original request with new token
   └─ Complete request ✓
   ↓
7. If refresh failed:
   ├─ Clear all tokens
   ├─ Redirect to /login
   └─ User must re-authenticate
```

### **Logout Flow**

```
1. User clicks "Logout"
   ↓
2. Frontend makes POST /api/auth/logout
   ├─ Includes access_token in Authorization header
   ↓
3. Backend confirms logout (optional token blacklist here in future)
   ↓
4. Frontend clears tokens:
   ├─ Clear memory (access_token)
   ├─ Clear localStorage (refresh_token, user)
   ├─ Clear cookies (if using httpOnly)
   ↓
5. Frontend redirects to /login
   ↓
6. User is fully logged out
```

---

## 🛡️ Security Features

### **1. XSS (Cross-Site Scripting) Prevention**
- ✅ Access token never stored in localStorage (only memory)
- ✅ React auto-escapes all text content
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ No direct DOM manipulation
- ✅ Environment variables not exposed to client (use VITE_ prefix)

### **2. CSRF (Cross-Site Request Forgery) Prevention**
- ✅ CORS validates origin
- ✅ Same-site cookie restrictions (if using cookies)
- ✅ State-changing operations require POST/PUT/DELETE
- ✅ JWT prevents CSRF by requiring Authorization header

### **3. SQL Injection Prevention**
- ✅ SQLAlchemy ORM used (parameterized queries)
- ✅ No raw SQL queries
- ✅ Input validation on all endpoints

### **4. Brute Force Protection (Recommended Future)**
- Rate limiting on `/api/auth/google` endpoint
- Suggested: 5 requests per minute per IP address

### **5. Token Security**
- ✅ JWT_SECRET_KEY is 32+ characters (random)
- ✅ Access token has short 15-minute expiry
- ✅ Refresh token has 7-day expiry
- ✅ Tokens are signed with HS256 (HMAC-SHA256)
- ✅ Token payload doesn't contain passwords/sensitive data
- ✅ Only user_id in token (other data fetched from DB)

### **6. HTTPS/TLS**
- ✅ Talisman forces HTTPS in production
- ✅ Secure cookies only sent over HTTPS
- ✅ HSTS headers enforced

### **7. CORS Hardening**
- ✅ Whitelist specific origins (not `*`)
- ✅ Credentials allowed only for whitelisted domains
- ✅ Preflight requests validated

### **8. OAuth Security**
- ✅ Google tokens verified with Google's public keys
- ✅ Token signature validation prevents tampering
- ✅ Email verification (Google already verified it)
- ✅ Sub (provider ID) ensures unique mapping per provider

---

## 🔑 Secret Management

### **Production Secrets** (Should be in environment variables, NOT committed)

```env
# Must rotate every 90 days
JWT_SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_urlsafe(32))">

# Obtained from Google Cloud Console
GOOGLE_CLIENT_ID=<your-oauth-client-id>

# Database password
DATABASE_URL=postgresql://user:PASSWORD@host:5432/db
```

### **Safe to Commit**
```env
FLASK_ENV=production
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800
```

### **Generate Secure Secrets**

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -base64 32

# Linux/Mac
head -c 32 /dev/urandom | base64
```

---

## 📊 Session Lifecycle

```
┌─────────────────────────────────┐
│   UNAUTHENTICATED               │
│   - No tokens                   │
│   - See /login page             │
│   - Cannot access /             │
└────────────┬────────────────────┘
             │ (Click Login)
             ▼
┌─────────────────────────────────┐
│   AUTHENTICATING                │
│   - Redirecting to Google       │
│   - Waiting for token           │
└────────────┬────────────────────┘
             │ (Complete Google OAuth)
             ▼
┌─────────────────────────────────┐
│   AUTHENTICATED                 │
│   - Tokens in memory            │
│   - Can access /onboarding      │
│   - access_token valid for 15min│
└────────────┬────────────────────┘
             │ (Complete onboarding)
             ▼
┌─────────────────────────────────┐
│   DASHBOARD ACCESS              │
│   - Full app access             │
│   - Auto-refresh tokens         │
│   - Logout available            │
└────────────┬────────────────────┘
             │ (After 15 minutes)
             ▼
┌─────────────────────────────────┐
│   TOKEN EXPIRED                 │
│   - Auto-refresh triggered      │
│   - New token obtained          │
│   - Seamless for user           │
└────────────┬────────────────────┘
             │ (After 7 days)
             │ (or manual logout)
             ▼
┌─────────────────────────────────┐
│   LOGGED OUT                    │
│   - Tokens cleared              │
│   - Redirected to /login        │
└─────────────────────────────────┘
```

---

## ⚠️ Security Warnings

### **DO NOT:**
- ❌ Store access_token in localStorage
- ❌ Log tokens in console/error messages
- ❌ Send tokens in URL query parameters
- ❌ Use weak JWT_SECRET_KEY (< 32 chars)
- ❌ Commit secrets to Git
- ❌ Use `*` for CORS origins
- ❌ Trust user-provided IDs (always verify server-side)
- ❌ Skip token expiration

### **DO:**
- ✅ Rotate JWT_SECRET_KEY every 90 days
- ✅ Use HTTPS in production
- ✅ Validate all user input
- ✅ Verify OAuth tokens with provider
- ✅ Store secrets in environment variables
- ✅ Log security events (failed logins, etc.)
- ✅ Monitor token usage patterns
- ✅ Update dependencies regularly

---

## 🧪 Security Testing Checklist

- [ ] Access token not persisted in localStorage
- [ ] Refresh token cleared on logout
- [ ] User redirected to login after token expiry
- [ ] CORS rejects requests from unknown origins
- [ ] Invalid JWT returns 401
- [ ] Expired JWT triggers auto-refresh
- [ ] Expired refresh_token logs user out
- [ ] SQL injection attempts fail
- [ ] XSS attempts don't execute
- [ ] CSRF attempts are blocked
- [ ] Rate limiting prevents brute force
- [ ] Secrets not logged anywhere
- [ ] HTTPS enforced in production
- [ ] Google token tampering is detected

---

## 📚 References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Flask-JWT-Extended Docs](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy Security](https://docs.sqlalchemy.org/en/20/core/connections.html)

---

**Security Model: Enterprise Grade ✅**
