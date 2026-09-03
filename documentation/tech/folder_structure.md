# Folder structure

```
portfolio_ai_chat/
  vite.config.ts
  tsconfig.json
  package.json
  .env.example
  vite/
    chat-mock-plugin.ts    mock REST (step 5)
  frontend/
    index.html
    public/                 static assets (optional)
    source/
      scripts/
        main.ts             entry; imports main.scss
        blocks/             UI mount (chat-widget, host-page)
        features/           MessageService and widget logic
        api/                fetch clients (chat-api)
        types/              .d.ts (chat.d.ts, vite-env.d.ts)
        pages/              unused in this demo; reserved for layout parity
      styles/
        main.scss
        base/                 variables, normalise
        blocks/               one BEM block per file
          button.scss         shared control chrome
          input.scss          shared control chrome
          textarea.scss       shared control chrome
          host-page.scss
          chat-open-button.scss
          chat-panel.scss
          chat-history.scss
  documentation/            tracked human docs
  dist/                       build output (gitignored)
```

Vite root is `frontend/`. SCSS is imported from `main.ts`, not linked in HTML.

Shared control blocks (`.button`, `.input`, `.textarea`) live under `styles/blocks/` — compose them from feature markup; rules in [`.prompts/base/how_to_visualise.md`](../../.prompts/base/how_to_visualise.md).
