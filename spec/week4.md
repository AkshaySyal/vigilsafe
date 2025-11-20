# Week 4 — Analytics Dashboard

**Status: COMPLETE + ALL TESTS PASSING**
**Date built: 2026-05-28**

---

## What Was Built (from PDF)

### Backend
- `GET /stats/incidents_by_category` — count per category (work/school/community/family)
- `GET /stats/incidents_over_time` — count per calendar date, ordered ascending
- `GET /stats/top_tags` — top 10 most-frequent risk tags (by occurrence across incidents)
- `GET /stats/severity_distribution` — count per severity (low/medium/high)
- **All 4 stats endpoints respect multi-tenant org visibility** — same scoping logic as `/incidents/`

### Frontend (pre-wired from scaffold)
- `Analytics.jsx` uses Recharts with 4 panels:
  - `BarChart` — incidents by category
  - `PieChart` — severity distribution (color coded: green/yellow/red)
  - `LineChart` — incidents over time
  - `BarChart (horizontal)` — top tags
- Empty state shown per-chart ("No data yet") until incidents exist
- All 4 stats API calls made in `useEffect` on mount

---

## Implementation Decisions

| Decision | Choice | Why |
|---|---|---|
| Stats visibility scoping | Same `_visible_query()` helper as incidents | Consistent — org members see org stats, anon see public stats |
| `top_tags` implementation | Python-side tag counting (not SQL JSON query) | SQLite has no built-in JSON array expand; pure Python is simpler and fast enough for MVP |
| `over_time` date grouping | `func.date(created_at)` | SQLite-compatible; works in PostgreSQL too with same syntax |
| `with_entities()` pattern | ORM `.with_entities(col, func)` | Avoids raw SQL, keeps scoping filter applied, returns named tuples |
| Recharts over D3.js | Recharts | React-native charts, no imperative DOM manipulation, much simpler for MVP; D3 can replace later |

---

## Key Validation: Org Scoping in Stats

Stats correctly reflect org membership:

| Requester | `/incidents_by_category` school count | Why |
|---|---|---|
| Anonymous | 1 | Only public school incidents |
| User B (org member) | 2 | Public + org-scoped school incident both counted |

---

## Test Results (all curl, against http://localhost:5001)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | /stats/incidents_by_category (anon) | 3 categories, 1 each | ✅ PASS |
| 2 | /stats/incidents_by_category (org member) | school count = 2 (includes org incident) | ✅ PASS |
| 3 | /stats/incidents_over_time (auth) | 1 date entry with count=4 | ✅ PASS |
| 4 | /stats/top_tags (auth) | physical_hazard:2, bullying:2 as top tags | ✅ PASS |
| 5 | /stats/severity_distribution (anon) | high:1, medium:2 | ✅ PASS |
| 6 | /stats/severity_distribution (org member) | high:1, medium:3 (org incident included) | ✅ PASS |

---

## What Week 5 Adds (from PDF)

- Image upload endpoint: `POST /incidents/upload-image`
- Store image locally (filesystem) with S3-ready interface — swap by changing one config variable
- File validation: MIME type must be image/jpeg, image/png, image/gif, image/webp; max 5MB
- Return `image_url` that gets stored on the incident
- Frontend: "Attach Photo (Optional)" file input in ReportIncident.jsx
- Two-step flow: upload image first → get URL → include URL in incident create payload
