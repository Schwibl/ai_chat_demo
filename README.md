# portfolio-ai-chat

[![PR checks](https://github.com/Schwibl/ai_chat_demo/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/Schwibl/ai_chat_demo/actions/workflows/pr-checks.yml)

Vanilla TypeScript AI chat widget with optimistic UI and mock REST — portfolio extract of production embed patterns.

Live demo: https://<project>.vercel.app

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5174 and click **Chat**.

```bash
npm run build      # typecheck + production bundle → dist/
npm run preview    # serve dist/ (mock API included)
npm run typecheck  # tsc --noEmit
npm run e2e        # Playwright smoke against vite preview (build first)
```

No API key. The mock server is `vite/chat-mock-plugin.ts`. Opening chat on a static host that does not run that plugin shows a short “Chat API is not available” message instead of throwing.

## Docs

- [CI pipeline](docs/ci.md)
- [Overview and demo walkthrough](documentation/README.md)
- [Architecture](documentation/architecture.md)
- [Local dev](documentation/dev/local_server.md)
- [Folder structure](documentation/tech/folder_structure.md)
- [Known gaps](documentation/tech/next_steps.md)

## Stack

TypeScript, Vite, SCSS (BEM). No React or Preact.

Mock replies only — no live LLM in this repo.
