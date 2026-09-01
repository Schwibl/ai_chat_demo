# Architecture

```
main.ts → chat-widget.ts
            ├── MessageService (features/message-service.ts)
            └── api/chat-api.ts → Vite mock plugin
```

Widget owns DOM for host page stub, open button, and panel. MessageService handles init, render, send, poll.

Mock store is in-memory per chat token (see `vite/chat-mock-plugin.ts`).
