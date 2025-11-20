# Week 6 — UX Polish + Public Launch Features

**Status: COMPLETE + ALL TESTS PASSING**
**Date built: 2026-05-28**

---

## What Was Built (from PDF)

### Backend
- `GET /guidance/` — returns array of bilingual safety guidance sections
- `GET /guidance/?lang=es` — returns Spanish sections
- Fallback: unsupported lang codes default to English
- 4 sections × 5 steps each (EN + ES): Emergency, Document Safely, Avoid Risk, Resources
- Bilingual Vite proxy added: `/guidance → http://localhost:5001`

### Frontend
- New `SafetyGuidance.jsx` page — fetches from `/guidance/?lang={current_lang}`, re-fetches on language toggle
- Privacy commitment + Terms of Use section at bottom (bilingual)
- Nav updated: "Safety Guide" / "Guía de Seguridad" link added
- Route `/guidance` added to `App.jsx`
- New locale keys: `guidance.title`, `guidance.subtitle`, `guidance.privacy_title`, `guidance.privacy_body`, `guidance.terms_body`, `nav.guidance`

---

## Implementation Decisions

| Decision | Choice | Why |
|---|---|---|
| Guidance content in Python | Hardcoded dict in `guidance.py` | No DB needed; content is static editorial copy — easy to edit in one place |
| Guidance re-fetches on lang toggle | `useEffect` depends on `lang` | Ensures Spanish content loads immediately when user toggles — no stale EN text |
| Terms/Privacy location | Bottom of guidance page | Natural place users look; same pattern as most safety apps |
| Privacy/Terms content | Minimal but specific | Commit to no data selling, explain anonymous mode, and scope of use — sufficient for MVP |
| Emoji icons in guidance | Unicode in JSON | Browser/React renders fine; shell grep breaks on emoji (documented in test notes) |

---

## Test Results (8/8 — Python JSON-based assertion)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | GET /guidance/ English | 4 sections returned | ✅ PASS |
| 2 | EN: emergency section exists | `id == "emergency"` in list | ✅ PASS |
| 3 | EN: resources section exists | `id == "resources"` in list | ✅ PASS |
| 4 | EN: each section has 5 steps | `len(steps) == 5` for all | ✅ PASS |
| 5 | GET /guidance/?lang=es | 4 Spanish sections | ✅ PASS |
| 6 | ES: title in Spanish | "Emergencia" in title | ✅ PASS |
| 7 | ES: each section has 5 steps | `len(steps) == 5` for all | ✅ PASS |
| 8 | Invalid lang → fallback English | Same sections as EN | ✅ PASS |

> **Note:** Shell `grep` with `LC_ALL=C` cannot match inside JSON strings containing emoji characters. Tests for guidance use Python `json.loads()` assertions instead. All other week tests use grep without issue.

---

## Complete Backend Route Map

| Method | Route | Auth | Week |
|---|---|---|---|
| POST | /auth/register | None | 1 |
| POST | /auth/login | None | 1 |
| GET | /auth/me | Required | 1 |
| POST | /incidents/create | Optional | 2 |
| GET | /incidents/ | Optional | 2/3 |
| GET | /incidents/<id> | Optional | 2/3 |
| GET | /organizations/ | Required | 3 |
| POST | /organizations/create | Required | 3 |
| POST | /organizations/join/<id> | Required | 3 |
| GET | /stats/incidents_by_category | Optional | 4 |
| GET | /stats/incidents_over_time | Optional | 4 |
| GET | /stats/top_tags | Optional | 4 |
| GET | /stats/severity_distribution | Optional | 4 |
| POST | /uploads/image | Optional | 5 |
| GET | /uploads/<filename> | None | 5 |
| GET | /guidance/ | None | 6 |

---

## Known Issues / Future Work

1. **NLP false positives** — "unsafe" triggers `physical_hazard` even in harassment incidents. Fix: tighten keyword lists or add negation logic.
2. **No JWT refresh** — tokens expire in 24h; user must re-login. Add `/auth/refresh` with refresh tokens for production.
3. **S3 not yet live** — image upload stores locally. Swap: set `USE_S3=true` + AWS creds in `.env`, uncomment 4 lines in `storage.py`.
4. **PostgreSQL not yet connected** — SQLite works for dev. Change `DATABASE_URL` in `.env` to `postgresql://...` for production.
5. **No rate limiting** — add `Flask-Limiter` before public launch.
6. **No email verification** — users can register with any email. Add verification flow for production.
7. **Frontend not deployed** — Vercel deploy: `cd frontend && npx vercel --prod`.
8. **Backend not deployed** — Render deploy: push to GitHub, connect repo, set env vars. Or `docker build` for EC2.

---

## How to Resume Work

```bash
# Start backend
cd backend && source venv/bin/activate && python run.py
# → http://localhost:5001

# Start frontend
cd frontend && npm run dev
# → http://localhost:5173

# Spec files for each week
spec/week1.md  — Auth, JWT setup, port fix
spec/week2.md  — NLP, incident create/list
spec/week3.md  — Multi-tenant orgs, visibility scoping
spec/week4.md  — Analytics stats, org-scoped counting
spec/week5.md  — Image upload, S3 migration path
spec/week6.md  — Safety guidance, terms/privacy (this file)
```
