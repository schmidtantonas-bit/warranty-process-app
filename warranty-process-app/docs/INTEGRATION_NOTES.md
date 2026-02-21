# Warranty JSON Transfer Notes

## Purpose
This file is the single reference for how warranty data is exported now, what is safe for testing, and what must be changed for production scaling/security.

## Current State (as of now)
- Frontend app: Angular 17 (`warranty-process-app`).
- Export action: user clicks `Senden`, app generates and downloads JSON file locally.
- Export format: German keys (mapped in `WizardStateService.exportPayload()`).
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
1. Add Function endpoint for photo upload.
2. Add Function endpoint for final JSON submit (metadata + business fields).
3. Update Angular `submit()` to send payload to API instead of local download.
4. Define stable JSON schema version (for Power Automate mapping).
5. Document environment variables and role assignments in Azure.

## Notes
- Local dev auto-reload was unstable in OneDrive path without polling.
- Recommended dev start command in this workspace:
  - `npm run start -- --poll=1000`
