# VigilSafe — Production Setup Plan

All 6 weeks of backend + frontend development are complete and tested.
This file tracks the production infrastructure setup phase.

---

## Setup Checklist

- [ ] **Step 1 — GitHub repo** — `git init` + push to GitHub (required by both Vercel and Render)
- [ ] **Step 2 — Deploy frontend → Vercel** (free tier) — connect GitHub repo, auto-builds on push
- [ ] **Step 3 — Deploy backend → Render** (free tier) — connect GitHub repo, set env vars, live Flask API
- [ ] **Step 4 — AWS S3** — create bucket, add creds to `.env`, uncomment 4 lines in `storage.py`, set `USE_S3=true`
- [ ] **Step 5 — HuggingFace API** — get free API key at huggingface.co, add `HUGGINGFACE_API_KEY` to `.env` — AI summaries activate automatically
- [ ] **Step 6 — PostgreSQL** — swap SQLite for hosted Postgres (Supabase or Railway free tier) via `DATABASE_URL` env var

---

## Notes

- `.env`, `venv/`, `node_modules/`, `.db` files are all in `.gitignore` — safe to push
- Backend runs on port 5001 (macOS AirPlay takes 5000)
- Frontend Vite proxy routes `/auth`, `/incidents`, `/stats`, `/organizations`, `/uploads`, `/guidance` → `http://localhost:5001`
- After deploy, the Vite proxy is replaced by the real Render backend URL (set as `VITE_API_URL` env var in Vercel)

---

## Quick Start (local dev)

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python run.py

# Terminal 2 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```