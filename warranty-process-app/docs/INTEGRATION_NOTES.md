# Warranty JSON Transfer Notes

## Purpose
This file is the single reference for how warranty data is exported now, what is safe for testing, and what must be changed for production scaling/security.

## Current State (as of now)
- Frontend app: Angular 17 (`warranty-process-app`).
- Submit action: user clicks `Senden`, frontend sends JSON to `/api/submit-warranty`.
- API bridge: `api/submit-warranty` validates payload and forwards it to `POWER_AUTOMATE_URL`.
- Export format: German keys (mapped in `WizardStateService.exportPayload()`).
- Payload includes `schema_version` and `meta.request_id`/`meta.exported_at_utc`.
- Photos: embedded in JSON as `data:image/...;base64,...` strings.
- Compression: browser-side canvas compression before storing in state.
  - Current defaults in `src/app/core/lib/image/image-compression.ts`:
  - `maxWidth: 1600`
  - `maxHeight: 1080`
  - `quality: 0.82`
  - `mimeType: image/jpeg`

## What This Means
- For test/internal validation with limited photo count, current flow is acceptable.
- Main risk is payload growth from base64 images (size overhead and slower processing).
- Risk is driven by total payload size, not only by number of photos.

## Known Risk Points
- Browser memory/performance can degrade if many large photos are present.
- Azure Function / Power Automate can hit body-size/performance limits on large JSON.
- Large base64 payloads are slower to parse and store than metadata + blob links.

## Recommended Production Architecture
- Use `Azure Blob Storage + links`, not base64 in main JSON.
- Target flow:
1. Upload photo to backend API (Azure Function).
2. Function stores photo in private Blob container.
3. Function returns photo metadata:
   - `photo_url`
   - `file_name`
   - `mime_type`
   - `size`
4. Final JSON contains form fields + photo metadata/links only.
5. Power Automate stores links (or fetches file by link if needed).

## Security Requirements (must-have)
- HTTPS only for all requests.
- Blob container access level: `Private`.
- No storage keys/secrets in Angular frontend.
- Use Function Managed Identity + RBAC (`Storage Blob Data Contributor`).
- Validate upload in Function:
  - allowed MIME types
  - max file size
  - max files per request/case
- Use short-lived SAS only if direct access is required.
- Keep audit fields (who uploaded, when, case id).

## Practical Decision Rule
- Keep current base64 export for test phase.
- Move to Blob+links before production rollout or if payload/performance issues appear.

## Immediate Next Steps (when ready)
1. In Azure Static Web App add environment variable: `POWER_AUTOMATE_URL`.
2. In Power Automate create HTTP-trigger flow and copy trigger URL.
3. Verify GitHub workflow deploys both app and API (`app_location` + `api_location`).
4. In Power Automate parse payload by schema and convert base64 photos to binary files.
5. Add optional auth restrictions (SWA roles) when test phase ends.

## Notes
- Local dev auto-reload was unstable in OneDrive path without polling.
- Recommended dev start command in this workspace:
  - `npm run start -- --poll=1000`
