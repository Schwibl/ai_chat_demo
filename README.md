# portfolio-ai-chat

Vanilla TypeScript AI chat widget with optimistic UI and mock REST — portfolio extract of production embed patterns.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5174 and click **Chat**.

```bash
npm run build    # typecheck + production bundle → dist/
npm run preview  # serve dist/ (mock API included)
```

## Docs

- [Overview and demo walkthrough](documentation/README.md)
- [Architecture](documentation/architecture.md)
- [Local dev](documentation/dev/local_server.md)
- [Folder structure](documentation/tech/folder_structure.md)
- [Known gaps](documentation/tech/next_steps.md)

## Stack

TypeScript, Vite, SCSS (BEM). No React or Preact.

Mock replies only — no live LLM in this repo.
