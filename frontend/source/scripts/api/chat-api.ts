const API_BASE = '/api/chat';

// Shared POST JSON helper for mock chat REST
async function postJson<T>(path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API ${path} failed`);
  }

  return response.json() as Promise<T>;
}

// Init chat session
export function apiInit(): Promise<t_ChatInitResponse> {
  return postJson('/init/', {});
}

// Fetch message history
export function apiGetMessages(chatToken: string): Promise<t_ChatMessagesResponse> {
  return postJson('/getMessages/', { chatToken });
}

// Send user message
export function apiSendMessage(chatToken: string, text: string): Promise<{ ok: boolean }> {
  return postJson('/sendMessage/', { chatToken, text });
}
