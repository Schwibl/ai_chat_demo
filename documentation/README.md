# AI chat widget demo

Embeddable chat widget in vanilla TypeScript. Scripted in-browser replies, optimistic send, follow-up chips. Extract of production CMS embed patterns (Neurohelper K / Atom Media).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5174. Click **Chat**, send a message, try **Expand** for centered layout, click a follow-up chip after a reply.

`npm run preview` serves the production build from `dist/`. Chat still runs in the page; preview does not add a server.

## Stack

TypeScript, Vite, SCSS with BEM. No React.

## What this demo shows

- Host page stub plus floating trigger and panel (embed pattern)
- Outside click, close button, and Escape dismiss the panel
- Scripted replies in the browser; the page does not call `/api`
- Optimistic user bubbles reconciled from the local thread
- Preparing indicator while a reply is pending; failed sends show an inline error and Retry
- Follow-up chips that send the chip label as the next message
- `localStorage` session token across panel reopens

## Production context

The production widget shipped as a CDN IIFE on a Bitrix site. This repo is a self-contained demo with generic copy and scripted replies instead of a live model.

## Further reading

- [Architecture](architecture.md)
- [Local server](dev/local_server.md)
- [Known gaps](tech/next_steps.md)
