# VigilSafe / VigilSeguro

A bilingual (English/Español) community safety platform for reporting, analyzing, and visualizing safety concerns in workplaces, schools, neighborhoods, and homes.

**Live:** https://vigilsafe-chi.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Recharts, i18n (en/es) |
| Backend | Python, Flask, Flask-JWT-Extended |
| Database | PostgreSQL |
| Storage | AWS S3 |
| AI/NLP | HuggingFace Inference API + local fallback |
| Hosting | Vercel (frontend), Render (backend) |

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)

### 1. Clone the repo

```bash
git clone https://github.com/AkshaySyal/vigilsafe.git
cd vigilsafe
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///vigilsafe.db   # or postgres://...
USE_S3=false
HUGGINGFACE_API_KEY=hf_...            # optional — local fallback works without it
```

Run the backend:

```bash
python run.py
# → http://localhost:5001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

### Backend (Render / `.env`)

| Variable | Description |
|---|---|
| `SECRET_KEY` | Flask secret key |
| `JWT_SECRET_KEY` | JWT signing key |
| `DATABASE_URL` | PostgreSQL connection string |
| `USE_S3` | `true` to enable S3 uploads, `false` for local |
| `AWS_BUCKET` | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `AWS_DEFAULT_REGION` | e.g. `us-east-1` |
| `HUGGINGFACE_API_KEY` | HuggingFace Inference API key (optional) |

### Frontend (Vercel / `.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL, e.g. `https://vigilsafe-backend.onrender.com` |

---

## Key API Endpoints

```
POST   /auth/register          Create account
POST   /auth/login             Login, returns JWT

POST   /incidents/create       Submit incident report (reporter+ role)
GET    /incidents/             List incidents (filtered by org)
GET    /incidents/<id>         Get single incident

POST   /organizations/create   Create org (becomes admin)
POST   /organizations/join/<id> Join an org
PATCH  /organizations/<id>/members/<user_id>/role  Set member role (admin only)

POST   /uploads/image          Upload photo → S3
GET    /stats/incidents_by_category
GET    /stats/incidents_over_time
GET    /stats/top_tags
```

---

## Role-Based Access

| Role | Submit Reports | View Incidents | Manage Org |
|---|---|---|---|
| viewer | No | Yes | No |
| reporter (default) | Yes | Yes | No |
| admin | Yes | Yes | Yes |

---

## Features

- Bilingual UI — English / Español toggle, no page reload
- Anonymous or authenticated incident submission
- AI risk analysis — keyword extraction, risk tagging, severity classification, AI summary
- Image upload with file validation, stored in AWS S3
- Multi-tenant org spaces — no cross-organization data visibility
- Analytics dashboard — incidents over time, by category, top tags, severity distribution
- Bilingual safety guidance page
