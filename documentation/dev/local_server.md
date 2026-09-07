# Local dev

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server on port **5174** |
| `npm run build` | Typecheck (`tsc --noEmit`) + production build to `dist/` |
| `npm run preview` | Serve `dist/` locally (mock API plugin runs here too) |

Open http://localhost:5174 after `npm run dev`.

## Env

Copy `.env.example` to `.env` if you add `VITE_*` vars later. The default demo needs no env file.

## Mock API

Dev and preview serve chat REST via `vite/chat-mock-plugin.ts`:

| Method | Path |
|--------|------|
| POST | `/api/chat/init/` |
| POST | `/api/chat/getMessages/` |
| POST | `/api/chat/sendMessage/` |

See [architecture.md](../architecture.md) for the client seam and store behaviour.

## Build output

Production assets land in `dist/` at repo root (`vite.config.ts` sets `root: 'frontend'`, `outDir` → `dist/`).
