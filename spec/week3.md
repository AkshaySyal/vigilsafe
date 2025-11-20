# Week 3 — Incident Library + Org Spaces

**Status: COMPLETE + ALL TESTS PASSING**
**Date built: 2026-05-28**

---

## What Was Built (from PDF)

### Backend
- `POST /organizations/create` — creates org, sets creator as admin, assigns creator `org_id`
- `POST /organizations/join/<id>` — adds user to org (sets `user_id → org_id`)
- `GET /organizations/` — lists all orgs (requires auth; for join UI)
- **Multi-tenant incident visibility** enforced in `GET /incidents/` and `GET /incidents/<id>`:
  - Public incidents (`org_id = null`) → visible to everyone including anonymous
  - Org incidents (`org_id = N`) → visible only to members of org N
  - Non-members receive a 403 on direct fetch of org-scoped incidents
- **Org membership validation** on `POST /incidents/create`:
  - If `org_id` passed, user must be a member of that org or receives 403

### Security Model (Multi-Tenant)
```
Anonymous user     → sees only org_id=null incidents
Logged-in, no org  → sees only org_id=null incidents
Logged-in, org=A   → sees org_id=null + org_id=A incidents
Cross-org POST     → 403 "not a member of that organization"
Cross-org GET      → 403 "Access denied"
```

---

## Implementation Decisions

| Decision | Choice | Why |
|---|---|---|
| Org visibility scope | Public (null) OR own org | Cleanest model; public library stays accessible, org space stays private |
| Role assignment on create | Creator becomes `admin` | Simplest default; role-based UI can use this to show admin controls |
| `org_id` removal from filter params | Removed `?org_id=` filter | Superseded by auth-based scoping — passing org_id manually bypasses privacy model |
| `_current_user()` helper | Extracted to shared function | `verify_jwt_in_request(optional=True)` + `User.query.get()` used in 3 places; DRY |
| Cross-org block on single fetch | 403 not 404 | 403 reveals incident exists but blocks access; 404 would be more private but harder to debug |

---

## Test Results (all curl, against http://localhost:5001)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | POST /organizations/create (admin) | 201 + org object | ✅ PASS |
| 2 | GET /organizations/ (authenticated) | 200 + list of orgs | ✅ PASS |
| 3 | POST /auth/register user B | 201 + token | ✅ PASS |
| 4 | POST /organizations/join/1 (user B) | 200 + joined message | ✅ PASS |
| 5 | POST /incidents/create with org_id (user A, member) | 201 + incident stored with org_id=1 | ✅ PASS |
| 6 | GET /incidents/ (user B, same org) | 4 incidents visible (3 public + 1 org-scoped) | ✅ PASS |
| 7 | Register user C in different org | 201 | ✅ PASS |
| 8 | GET /incidents/ (user C, diff org) | 3 incidents visible (public only) | ✅ PASS |
| 9 | GET /incidents/4 (user C, org-scoped incident) | 403 "Access denied" | ✅ PASS |
| 10 | GET /incidents/ (anonymous) | 3 incidents (public only) | ✅ PASS |
| 11 | POST /incidents/create with org_id=1 (user C, non-member) | 403 "not a member" | ✅ PASS |

---

## What Week 4 Adds (from PDF)

- `GET /stats/incidents_by_category` — count grouped by category
- `GET /stats/incidents_over_time` — count per day
- `GET /stats/top_tags` — top 10 most frequent risk tags across all public incidents
- `GET /stats/severity_distribution` — count per severity level
- Stats endpoints respect org visibility (only count incidents the requester can see)
- Frontend: 4 Recharts panels already wired in Analytics.jsx — need to verify data flows correctly
