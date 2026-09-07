# Architecture

## Overview

```
main.ts → chat-widget.ts
            ├── host-page + chat-open-button
            ├── chat-panel-backdrop + chat-panel
            ├── MessageService (features/message-service.ts)
            └── api/chat-api.ts → Vite mock plugin
```

The widget mounts into `#app`. In production, only the trigger and panel would inject into an existing page; the host block here simulates that page.

## Host shell

| Block | File | Role |
|-------|------|------|
| `host-page` | `styles/blocks/host-page.scss` | Demo page content |
| `chat-open-button` | `styles/blocks/chat-open-button.scss` | Fixed trigger; opens panel |

Markup is built in `blocks/chat-widget.ts`.

## Chat panel

| Block | File | Role |
|-------|------|------|
| `chat-panel-backdrop` | `styles/blocks/chat-panel-backdrop.scss` | Dim overlay; outside click closes |
| `chat-panel` | `styles/blocks/chat-panel.scss` | Header, history body, footer |
| `chat-history` | `styles/blocks/chat-history.scss` | Message list and chips |

Shared controls: `.button`, `.textarea` under `styles/blocks/`.

### Panel modifiers

| Class | Meaning |
|-------|---------|
| `chat-panel--opened` | Panel visible |
| `chat-panel--size-basic` | Corner dock |
| `chat-panel--size-full` | Centered modal (~60×75vw) |
| `chat-panel--loading` | Session init |
| `chat-panel--sending` | Message in flight |
| `chat-panel--error` | Send failed |

## Mock REST API

| Layer | Path |
|-------|------|
| Client | `frontend/source/scripts/api/chat-api.ts` |
| Types | `frontend/source/scripts/types/chat.d.ts` |
| Mock | `vite/chat-mock-plugin.ts` |
| Config | `vite.config.ts` → `plugins: [chatMockPlugin()]` |

All routes are **POST** JSON:

- `/api/chat/init/` → `{ chatToken }`
- `/api/chat/getMessages/` → `{ messages }`
- `/api/chat/sendMessage/` → `{ ok: true }`

The plugin keeps an in-memory `Map<chatToken, messages[]>`. Swap the plugin for `server.proxy` or a real backend in production; keep the client seam.

## MessageService

File: `frontend/source/scripts/features/message-service.ts`

| Concern | Behaviour |
|---------|-----------|
| Token | `localStorage` key `portfolio-chat-token`; `apiInit()` on first visit |
| Open | `start()` → load history → render greeting |
| Send | Optimistic `temp` user row → `apiSendMessage` → poll until assistant reply |
| Typing | `chat-history__item--typing` while polling |
| Chips | `followUps` buttons call `send(chipText)` |

Flow:

```
open panel → start()
send       → temp bubble → POST sendMessage → poll getMessages → preparing row → reply
chip click → send(label)
```

## Mock store limits

- Resets when the dev server restarts
- Canned assistant replies only — not a language model

See [tech/next_steps.md](tech/next_steps.md) for deliberate gaps.
