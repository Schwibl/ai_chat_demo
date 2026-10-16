# Next steps

Known limits for this portfolio demo (not a backlog promise):

- 2026-09-03 — Mock replies only; no live LLM or streaming.
- 2026-09-03 — No CDN IIFE bundle; Vite app and `dist/` output only.
- 2026-09-03 — Chat history lives in plugin memory; lost on server restart.
- 2026-10-16 — History text is escaped on paint; not a sanitizer for a richer message format.

Optional later:

- Point `vite.config.ts` `server.proxy` at a real chat backend.
- Ship a separate IIFE build for CMS embed parity.
