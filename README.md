# portfolio-ai-chat

[![PR checks](https://github.com/Schwibl/ai_chat_demo/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/Schwibl/ai_chat_demo/actions/workflows/pr-checks.yml)

An embeddable AI chat widget in vanilla TypeScript, with optimistic sending and follow-up chips. Replies are scripted in the browser; no server and no real model is called.

**Live:** https://ai-chat-demo-puce.vercel.app

## Stack
TypeScript 5.6, Vite 6, SCSS (BEM), Playwright 1.64 for e2e. No React or Preact.

## Run
```bash
npm install
npm run dev        # http://localhost:5174, click Chat
```
No env vars are needed. Chat does not call `/api`.

```bash
npm run typecheck
npm run build      # typecheck + bundle to dist/
npm run preview    # serve dist/
npm run e2e        # Playwright
```

More in [documentation/](documentation/README.md).
