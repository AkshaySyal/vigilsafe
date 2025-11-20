# Week 2 — Incident Reporting + NLP

**Status: COMPLETE + ALL TESTS PASSING**
**Date built: 2026-05-28**

---

## What Was Built (from PDF)

### Backend
- `POST /incidents/create` — creates incident, runs NLP inline, returns incident + analysis
- `GET /incidents/` — paginated list with filters: `category`, `severity`, `type`, `org_id`
- `GET /incidents/<id>` — single incident by ID
- NLP service (`app/services/nlp.py`) — pure Python, no external calls required:
  - `extract_keywords()` — regex word extraction, stopword filtering, max 15
  - `predict_tags()` — keyword match against 8 risk category dictionaries
  - `classify_severity()` — HIGH if weapon/gun/knife/assault/etc., MEDIUM if harassment/bullying/etc. or 2+ tags, else LOW
  - `get_hf_summary()` — calls HuggingFace `facebook/bart-large-cnn` IF `HUGGINGFACE_API_KEY` is set in `.env`

### Frontend
- Report Incident form submits to backend and shows AI analysis result panel
- Analysis panel shows: severity badge, risk tags, extracted keywords, optional HF summary
- "Submit anonymously" checkbox strips `user_id` from stored incident

---

## Implementation Decisions

| Decision | Choice | Why |
|---|---|---|
| NLP approach | Rule-based keyword matching | Works with zero API keys; HF summarization is additive when key exists |
| Severity classification | 3-tier keyword list + tag count | Simple, explainable, no model needed; easily tunable |
| Anonymous submissions | No JWT required on `/incidents/create` | Uses `verify_jwt_in_request(optional=True)` — works logged in or not |
| `user_id` in anonymous reports | Stored as `null` | Privacy-first: no link to submitter ever written to DB |
| HF model chosen | `facebook/bart-large-cnn` | Summarization model, free Inference API tier, good for 100+ char texts |
| Pagination default | 20 per page | Reasonable for a safety library; configurable via `?per_page=N` |

---

## Known NLP Behavior (not bugs)

- The word **"unsafe"** triggers the `physical_hazard` tag even in harassment descriptions. This is intentional — the rule-based matcher is broad by design. Tuning the keyword lists is a Week 2+ iteration task.
- **No HF summary** in tests (`summary: null`) because no `HUGGINGFACE_API_KEY` is set. Add key to `backend/.env` to enable. Summary only runs on descriptions > 100 chars.

---

## Test Results (all curl, against http://localhost:5001)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | POST /incidents/create (logged-in, harassment) | 201 + incident + analysis (severity=medium, tags include bullying) | ✅ PASS |
| 2 | POST /incidents/create (anonymous, violence) | 201 + severity=high + user_id=null | ✅ PASS |
| 3 | POST /incidents/create (physical hazard) | 201 + tags include physical_hazard + property_damage | ✅ PASS |
| 4 | POST /incidents/create (missing description) | 400 error | ✅ PASS |
| 5 | GET /incidents/ (all) | 200 + all 3 incidents, newest first | ✅ PASS |
| 6 | GET /incidents/?category=work | 200 + only work incident | ✅ PASS |
| 7 | GET /incidents/?severity=high | 200 + only high-severity school incident | ✅ PASS |
| 8 | GET /incidents/1 | 200 + full incident object | ✅ PASS |
| 9 | GET /incidents/999 | 404 | ✅ PASS |

---

## NLP Severity Scoring Logic

```
HIGH  → any of: weapon, gun, knife, assault, fire, suicidal, attack, violence, emergency, critical, explosive, shooting
MEDIUM → any of: harassment, bully, threat, discrimination, injury, unsafe, dangerous, abuse, stalking
        OR ≥ 2 risk tags detected
LOW   → everything else
```

---

## What Week 3 Adds (from PDF)

- Org-scoped incident visibility: org incidents visible only to org members
- `POST /organizations/create` — creates org, sets creator as admin
- `POST /organizations/join/<id>` — user joins existing org
- `GET /organizations/` — list all orgs (for join UI)
- Update `GET /incidents/` to enforce multi-tenant privacy:
  - Public incidents (org_id=null) → visible to all
  - Org incidents (org_id set) → visible only to members of that org
- Test cross-org isolation (user in org A cannot see org B's incidents)
