# Local dev

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server on port **5174** |
| `npm run build` | Typecheck (`tsc --noEmit`) + production build to `dist/` |
| `npm run preview` | Serve `dist/` locally |

Open http://localhost:5174 after `npm run dev`.

## Env

Copy `.env.example` to `.env` if you add `VITE_*` vars later. The default demo needs no env file.

## Chat

Replies are scripted in the browser. Dev and preview do not serve `/api/chat`. See [architecture.md](../architecture.md).

## Build output

Production assets land in `dist/` at repo root (`vite.config.ts` sets `root: 'frontend'`, `outDir` → `dist/`).
