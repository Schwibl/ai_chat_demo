# AI chat widget demo

Embeddable chat widget in vanilla TypeScript: mock REST, optimistic send, follow-up chips. Portfolio extract of production CMS integration patterns.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5174 — click **Chat**, send a message. Replies come from a Vite mock API (`vite/chat-mock-plugin.ts`).

`npm run preview` also serves the mock API for production builds.

## Stack

TypeScript, Vite, SCSS (BEM). No React.

## What it shows

- Floating trigger + panel with size toggle
- init / getMessages / sendMessage API seam
- Optimistic user bubbles and polling for assistant reply
- Follow-up chip actions

Production version used a CDN IIFE on a Bitrix site. This repo is a self-contained demo with generic branding.
