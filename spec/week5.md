# Week 5 — Image Upload + Security Enhancements

**Status: COMPLETE + ALL TESTS PASSING**
**Date built: 2026-05-28**

---

## What Was Built (from PDF)

### Backend
- `POST /uploads/image` — accepts `multipart/form-data` with `image` field, returns `{ image_url }`
- `GET /uploads/<filename>` — serves locally stored files (dev); in prod, S3/CDN handles this
- File validation in `app/services/storage.py`:
  - MIME type must be: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Max size: 5MB (checked by seeking to end of file)
  - UUID hex filename generated — no user-supplied filenames stored
- `image_url` now saved to `Incident` model when passed in `POST /incidents/create`
- Auth is optional on upload — anonymous reporters can attach photos

### Frontend
- `ReportIncident.jsx` updated with file picker:
  - Hidden `<input type="file">` triggered by styled button
  - Image preview thumbnail shown after selection
  - Two-step submit: upload image first → get URL → include in incident payload
  - Upload progress text shown during upload ("Uploading image...")
  - Remove button clears selection
- `uploadsAPI.image(file)` added to `src/services/api.js`
- Bilingual strings added: `attach_photo`, `choose_photo`, `photo_hint`

---

## Bug Fixed During Testing

**Bug:** `image_url` stored as `null` in incident even when passed in create payload.
**Root cause:** `Incident(...)` constructor in `/incidents/create` route didn't read `data.get('image_url')`.
**Fix:** Added `image_url=data.get('image_url')` to the Incident constructor.
**File changed:** `app/routes/incidents.py`

---

## Implementation Decisions

| Decision | Choice | Why |
|---|---|---|
| Local storage for dev | `backend/uploads/` dir | Zero config; S3 swap is one env var (`USE_S3=true`) + uncomment 4 lines |
| UUID hex filenames | `uuid.uuid4().hex` | Prevents path traversal, filename collisions, and metadata leakage |
| MIME validation | Check `file_storage.mimetype` | Browser sends correct MIME for normal uploads; sufficient for MVP |
| Max size check | Seek-to-end pattern | Works without reading full file into memory |
| Two-step upload flow | Upload image → get URL → create incident | Keeps `/incidents/create` JSON-only; image upload is composable |
| Auth optional on upload | `verify_jwt_in_request(optional=True)` | Anonymous reporters need to attach photos too |

## S3 Migration Path (Week 5+ or prod)

```bash
# 1. Install boto3
pip install boto3

# 2. Set env vars in backend/.env
USE_S3=true
AWS_BUCKET=vigilsafe-uploads
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# 3. Uncomment the S3 block in app/services/storage.py (4 lines)
# 4. Remove the serve_upload route from uploads.py (S3 serves directly)
```

---

## Test Results (all curl, against http://localhost:5001)

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | POST /uploads/image (anon, valid PNG) | 201 + image_url | ✅ PASS |
| 2 | POST /uploads/image (auth, valid PNG) | 201 + image_url | ✅ PASS |
| 3 | POST /incidents/create with image_url | image_url stored in incident | ✅ PASS (after fix) |
| 4 | GET /uploads/<filename> | 200 + Content-Type: image/png | ✅ PASS |
| 5 | POST /uploads/image (no file field) | 400 "No image field" | ✅ PASS |
| 6 | POST /uploads/image (text/plain MIME) | 422 "Invalid file type" | ✅ PASS |
| 7 | POST /uploads/image (6MB file) | 422 "File too large (6144KB)" | ✅ PASS |

---

## What Week 6 Adds (from PDF)

- `GET /guidance` — bilingual safety guidance content (JSON)
- Frontend: new `SafetyGuidance` page with bilingual content for:
  - What to do in emergencies
  - How to document safely
  - How to avoid personal risk
- Mobile layout polish (navbar wrapping, responsive cards)
- Terms of Use + Privacy notice (static text, bilingual)
- `SafetyGuidance` added to nav as "Safety Guide" / "Guía de Seguridad"
