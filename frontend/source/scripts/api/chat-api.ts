const THREADS_KEY = 'portfolio-chat-threads';
const REPLY_DELAY_MS = 750;

const GREETING: t_Message = {
  id: 'greeting',
  role: 'assistant',
  text: 'Hi. Ask anything — replies come from a mock server.',
  followUps: ['What can you do?', 'How is this built?'],
};

const ASSISTANT_REPLIES: { text: string; followUps: string[] }[] = [
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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readThreads(): Record<string, t_Message[]> {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, t_Message[]>;
  } catch {
    return {};
  }
}

function writeThreads(threads: Record<string, t_Message[]>): void {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

export function apiInit(): Promise<t_ChatInitResponse> {
  const chatToken = `demo-${Date.now()}`;
  const threads = readThreads();
  threads[chatToken] = [GREETING];
  writeThreads(threads);
  return Promise.resolve({ chatToken });
}

export function apiGetMessages(chatToken: string): Promise<t_ChatMessagesResponse> {
  const list = readThreads()[chatToken];
  return Promise.resolve({ messages: Array.isArray(list) ? list : [] });
}

export async function apiSendMessage(chatToken: string, text: string): Promise<{ ok: boolean }> {
  const threads = readThreads();
  const list = Array.isArray(threads[chatToken]) ? threads[chatToken] : [];
  const reply = ASSISTANT_REPLIES[list.length % ASSISTANT_REPLIES.length];
  const stamp = Date.now();

  list.push({ id: `u-${stamp}`, role: 'user', text });
  list.push({
    id: `a-${stamp}`,
    role: 'assistant',
    text: reply.text,
    followUps: reply.followUps,
  });
  threads[chatToken] = list;
  writeThreads(threads);
  await wait(REPLY_DELAY_MS);
  return { ok: true };
}
