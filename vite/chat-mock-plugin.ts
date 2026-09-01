import type { Plugin } from 'vite';

type t_StoredMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  followUps?: string[];
};

// In-memory mock store per chat token
const stores = new Map<string, t_StoredMessage[]>();

const ASSISTANT_REPLIES = [
  {
    text: 'Here is a short answer based on your question. This demo uses a mock API, not a live model.',
    followUps: ['Tell me more', 'Show an example', 'What stack is this?'],
  },
  {
    text: 'The widget uses optimistic UI: your message appears immediately, then the mock server adds this reply.',
    followUps: ['How does polling work?', 'Open GitHub repo'],
  },
  {
    text: 'Production version integrated into a CMS via a CDN bundle. This repo is a vanilla TS extract.',
    followUps: [],
  },
];

// Vite dev/preview mock for chat REST
export function chatMockPlugin(): Plugin {
  const attach = (middlewares: { use: (...args: unknown[]) => void }) => {
    middlewares.use('/api/chat', (req: import('http').IncomingMessage, res: import('http').ServerResponse, next: () => void) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        const url = req.url ?? '';
        let body = '';

        req.on('data', (chunk: Buffer) => {
          body += chunk;
        });

        req.on('end', () => {
          let payload: Record<string, string> = {};

          try {
            payload = body ? JSON.parse(body) : {};
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'bad json' }));
            return;
          }

          if (url.includes('/init')) {
            const token = `demo-${Date.now()}`;
            stores.set(token, [
              {
                id: 'greeting',
                role: 'assistant',
                text: 'Hi. Ask anything — replies come from a mock server.',
                followUps: ['What can you do?', 'How is this built?'],
              },
            ]);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ chatToken: token }));
            return;
          }

          if (url.includes('/getMessages')) {
            const token = payload.chatToken ?? '';
            const messages = stores.get(token) ?? [];
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ messages }));
            return;
          }

          if (url.includes('/sendMessage')) {
            const token = payload.chatToken ?? '';
            const text = payload.text ?? '';
            const list = stores.get(token) ?? [];
            const reply = ASSISTANT_REPLIES[list.length % ASSISTANT_REPLIES.length];

            list.push({ id: `u-${Date.now()}`, role: 'user', text });
            list.push({
              id: `a-${Date.now()}`,
              role: 'assistant',
              text: reply.text,
              followUps: reply.followUps,
            });
            stores.set(token, list);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'not found' }));
        });
      });
  };

  return {
    name: 'chat-mock-api',
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
