# Architecture

## Host shell vs widget (step 3)

The demo simulates a client site plus an embeddable chat entry point:

| Block | File | Role |
|-------|------|------|
| `host-page` | `styles/blocks/host-page.scss` | Fake page content (title + paragraph) |
| `chat-open-button` | `styles/blocks/chat-open-button.scss` | Fixed floating trigger; opens the panel |

Markup is mounted into `#app` from `blocks/chat-widget.ts`. In production, only the trigger and panel would inject into an existing host page; here the host block stands in for that page.

Panel actions and the message field compose shared control blocks (`.button`, `.textarea`) — see [`.prompts/base/how_to_visualise.md`](../.prompts/base/how_to_visualise.md).

## Runtime flow

```
main.ts → chat-widget.ts
            ├── host-page + chat-open-button (embed surface)
            ├── chat-panel (step 4)
            ├── MessageService (features/message-service.ts)
            └── api/chat-api.ts → Vite mock plugin
```

MessageService handles init, render, optimistic send, and polling once the panel is open.

Mock store is in-memory per chat token (see `vite/chat-mock-plugin.ts`).
