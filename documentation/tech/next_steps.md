# Next steps

Known limits for this portfolio demo (not a backlog promise):

- 2026-09-03 — Mock replies only; no live LLM or streaming.
- 2026-09-03 — No CDN IIFE bundle; Vite app and `dist/` output only.
- 2026-11-01 — Thread lives in `localStorage` (`portfolio-chat-threads`); clearing site data starts over.
- 2026-10-16 — History text is escaped on paint; not a sanitizer for a richer message format.

Optional later:

- Swap `frontend/source/scripts/api/chat-api.ts` for a real chat backend.
- Ship a separate IIFE build for CMS embed parity.
