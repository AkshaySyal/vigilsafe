# Week 1 — Project Setup + Bilingual Frontend

**Status: COMPLETE + ALL TESTS PASSING**
**Date built: 2026-05-28**

---

## What Was Built (from PDF)

### Backend
- Flask app factory pattern (`app/__init__.py` with `create_app()`)
- SQLite DB via SQLAlchemy (swap to PostgreSQL: change `DATABASE_URL` in `.env`)
- JWT authentication via Flask-JWT-Extended 4.x
- `POST /auth/register` — create user, return JWT token
- `POST /auth/login` — verify credentials, return JWT token
- `GET /auth/me` — return current user profile (requires Bearer token)

### Frontend
- React 18 + Vite scaffold on port 5173
- Bilingual toggle: `LanguageContext` wraps entire app, `en.json` + `es.json` cover all UI strings
- `AuthContext` — stores JWT in `localStorage`, exposes `login/register/logout`
- Pages scaffolded: Home, Login, Register, Dashboard, ReportIncident, IncidentLibrary, Analytics
- Vite dev proxy: `/auth`, `/incidents`, `/stats`, `/organizations` → `http://localhost:5001`

---

## Implementation Decisions

| Decision | Choice | Why |
|---|---|---|
| Database for dev | SQLite | Zero setup; swap to PostgreSQL with single env var change |
| JWT identity type | `str(user.id)` | Flask-JWT-Extended v4 requires string subject; convert back with `int()` on read |
| Backend port | 5001 (not 5000) | macOS Sonoma AirPlay Receiver occupies port 5000 — hard 403 from AirTunes |
| CORS origin | `http://localhost:5173` | Vite default port; proxied in dev so CORS not triggered in browser |
| Password hashing | Werkzeug `generate_password_hash` | Built-in to Flask ecosystem, PBKDF2-SHA256 |
| Bilingual approach | Static JSON dicts + context | No external i18n lib; `t('key.path')` dot-notation lookup |

---

## Bug Fixed During Testing

**Bug:** `GET /auth/me` returned `{"msg": "Subject must be a string"}`
**Root cause:** `create_access_token(identity=user.id)` passes an `int`; JWT-Extended v4 rejects non-string subjects.
**Fix:** Changed to `identity=str(user.id)` in both register and login. All `get_jwt_identity()` calls wrapped with `int()` when used as DB key.
**Files changed:** `app/routes/auth.py`, `app/routes/incidents.py`, `app/routes/organizations.py`

---

## Test Results (all curl, against http://localhost:5001)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | POST /auth/register (valid) | 201 + token + user | ✅ PASS |
| 2 | POST /auth/register (duplicate username) | 409 "Username already taken" | ✅ PASS |
| 3 | POST /auth/register (duplicate email) | 409 "Email already registered" | ✅ PASS |
| 4 | POST /auth/login (valid) | 200 + token + user | ✅ PASS |
| 5 | GET /auth/me (with token) | 200 + user object | ✅ PASS |
| 6 | POST /auth/login (bad password) | 401 "Invalid credentials" | ✅ PASS |
| 7 | POST /auth/register (missing fields) | 400 error message | ✅ PASS |
| 8 | GET /auth/me (no token) | 401 "Missing Authorization Header" | ✅ PASS |

---

## How to Run

```bash
# Terminal 1 — Backend (port 5001)
cd backend
source venv/bin/activate
python run.py

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

---

## What Week 2 Adds (from PDF)

- Define full Incident schema (category, type, description, location, severity, tags, keywords)
- `POST /incidents/create` — with NLP analysis inline
- Connect HuggingFace Inference API for keyword extraction / summarization
- `GET /incidents/` with filters (category, severity, type, org_id, pagination)
- Frontend: incident reporting form shows AI-generated hints after submit
