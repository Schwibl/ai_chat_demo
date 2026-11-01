# Architecture

## Overview

```
main.ts → chat-widget.ts
            ├── <main> host-page
            ├── <aside aria-label="Chat"> trigger, backdrop, panel
            ├── MessageService (features/message-service.ts)
            └── api/chat-api.ts (scripted replies in the browser)
```

The widget mounts into `#app`. In production, only the trigger and panel would inject into an existing page; the host block here simulates that page. The host is a `main` landmark. The trigger and panel sit in one named `aside`.

## Host shell

| Block | File | Role |
|-------|------|------|
| `host-page` | `styles/blocks/host-page.scss` | Demo page content |
| `chat-widget` | `styles/blocks/chat-widget.scss` | Fixed landmark that holds the trigger |
| `chat-open-button` | `styles/blocks/chat-open-button.scss` | Trigger; opens panel |

Markup is built in `blocks/chat-widget.ts`. At a viewport of 360px the Chat launcher is hidden while `.chat-panel` has `data-state="open"`.

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
| `chat-panel--error` | Init or send failed (inline text plus Retry) |

Opening the panel scales it from 0.96 to 1. Size checks wait until that transform is identity.

## Scripted replies

| Layer | Path |
|-------|------|
| Client | `frontend/source/scripts/api/chat-api.ts` |
| Types | `frontend/source/scripts/types/chat.d.ts` |

Nothing is fetched. `apiInit`, `apiGetMessages`, and `apiSendMessage` read and write one thread in `localStorage` (`portfolio-chat-threads`), keyed by the session token (`portfolio-chat-token`). The reply script is a fixed greeting (“Replies are scripted in your browser.”), then `ASSISTANT_REPLIES[messageCount % 3]` chosen before the new user and assistant rows are stored. Send waits briefly so the preparing row can paint, then the service reloads the thread.

## MessageService

File: `frontend/source/scripts/features/message-service.ts`

| Concern | Behaviour |
|---------|-----------|
| Token | `localStorage` key `portfolio-chat-token`; `apiInit()` on first visit |
| Open | `start()` → load history → render greeting. Empty history shows a local hint and chips |
| Send | Optimistic `temp` user row → `apiSendMessage` → poll until assistant reply |
| Typing | `chat-history__item--typing` from send start until the reply or an error |
| Failure | Inline “Couldn't get a reply.” and Retry; closed panel is `inert` |
| Chips | `followUps` buttons call `send(chipText)` |

History text is escaped before `innerHTML`, so a message cannot become markup. The widget reads `isSending()` before it clears the field, so a busy send does not drop the draft. `start()` catches a failed boot so the rejection is not uncaught.

Flow:

```
open panel → start()
send       → temp bubble + preparing → local send → reload thread → reply or inline Retry
chip click → send(label)
```

## Store limits

- Thread stays in this browser until site data is cleared
- Canned assistant replies only — not a language model

See [tech/next_steps.md](tech/next_steps.md) for deliberate gaps.
