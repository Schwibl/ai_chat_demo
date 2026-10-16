# portfolio-ai-chat

[![PR checks](https://github.com/Schwibl/ai_chat_demo/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/Schwibl/ai_chat_demo/actions/workflows/pr-checks.yml)

An embeddable AI chat widget in vanilla TypeScript, with optimistic sending, polling for replies and follow-up chips. Replies come from a mock REST API; no real model is called.

**Live:** https://ai-chat-demo-puce.vercel.app

## Stack
TypeScript 5.6, Vite 6, SCSS (BEM), Playwright 1.64 for e2e. No React or Preact.

## Run
```bash
npm install
npm run dev        # http://localhost:5174, click Chat
```
No env vars are needed. The mock API (`vite/chat-mock-plugin.ts`) runs in dev and preview.

```bash
npm run typecheck
npm run build      # typecheck + bundle to dist/
npm run preview    # serve dist/ with the mock API
npm run e2e        # Playwright
```

More in [documentation/](documentation/README.md).
