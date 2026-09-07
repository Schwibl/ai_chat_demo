# Folder structure

```
portfolio_ai_chat/
  README.md
  vite.config.ts
  tsconfig.json
  package.json
  .env.example
  vite/
    chat-mock-plugin.ts
  frontend/
    index.html
    public/
    source/
      scripts/
        main.ts
        blocks/           chat-widget mount
        features/         MessageService
        api/              chat-api.ts
        types/            chat.d.ts, vite-env.d.ts
      styles/
        main.scss
        base/             variables, normalise
        blocks/             BEM blocks (button, textarea, host-page, chat-*)
  documentation/
  dist/                   gitignored build output
```

Vite root is `frontend/`. SCSS is imported from `main.ts`, not linked in HTML.

Shared `.button`, `.input`, and `.textarea` blocks live under `styles/blocks/` and are composed from widget markup.
