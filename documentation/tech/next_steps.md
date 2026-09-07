# Next steps

Known limits for this portfolio demo (not a backlog promise):

- 2026-09-03 — Mock replies only; no live LLM or streaming.
- 2026-09-03 — No CDN IIFE bundle; Vite app and `dist/` output only.
- 2026-09-03 — Chat history lives in plugin memory; lost on server restart.
- 2026-09-03 — Message HTML is demo-safe static text; no user HTML sanitization layer shown.

Optional later:

- Point `vite.config.ts` `server.proxy` at a real chat backend.
- Ship a separate IIFE build for CMS embed parity.
