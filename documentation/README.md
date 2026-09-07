# AI chat widget demo

Embeddable chat widget in vanilla TypeScript. Mock REST backend, optimistic send, polling for replies, follow-up chips. Extract of production CMS embed patterns (Neurohelper K / Atom Media).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5174. Click **Chat**, send a message, try **Expand** for centered layout, click a follow-up chip after a reply.

`npm run preview` serves the production build from `dist/` and still runs the mock API.

## Stack

TypeScript, Vite, SCSS with BEM. No React.

## What this demo shows

- Host page stub plus floating trigger and panel (embed pattern)
- Outside click and close button dismiss the panel
- `POST /api/chat/init`, `/getMessages`, `/sendMessage` client seam
- Optimistic user bubbles reconciled from the server
- Polling with a preparing indicator until the assistant row appears
- Follow-up chips that send the chip label as the next message
- `localStorage` session token across panel reopens

## Production context

The production widget shipped as a CDN IIFE on a Bitrix site. This repo is a self-contained demo with generic copy and a Vite mock plugin instead of a live model.

## Further reading

- [Architecture](architecture.md)
- [Local server](dev/local_server.md)
- [Known gaps](tech/next_steps.md)
