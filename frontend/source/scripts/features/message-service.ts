import { apiGetMessages, apiInit, apiSendMessage } from '../api/chat-api';

const TOKEN_KEY = 'portfolio-chat-token';
const POLL_MS = 1500;

// Chat widget state and lifecycle
export class MessageService {
  private chatToken = '';
  private messages: t_Message[] = [];
  private pollTimer: number | null = null;
  private sendInProgress = false;

  constructor(
    private panel: HTMLElement,
    private historyEl: HTMLElement,
    private onFollowUp: (text: string) => void,
  ) {}

  // Boot: init API + first history load
  async start(): Promise<void> {
    this.panel.classList.add('chat-panel--loading');

    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      this.chatToken = stored;
    } else {
      const init = await apiInit();
      this.chatToken = init.chatToken;
      localStorage.setItem(TOKEN_KEY, this.chatToken);
    }

    await this.refreshMessages();
    this.panel.classList.remove('chat-panel--loading');
  }

  // Send with optimistic temp bubble
  async send(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || this.sendInProgress) {
      return;
    }

    this.sendInProgress = true;
    this.panel.classList.add('chat-panel--sending');

    const tempId = `temp-${Date.now()}`;
    this.messages.push({ id: tempId, role: 'user', text: trimmed, temp: true });
    this.render();

    try {
      await apiSendMessage(this.chatToken, trimmed);
      await this.waitForAssistantReply();
    } catch {
      this.panel.classList.add('chat-panel--error');
    } finally {
      this.sendInProgress = false;
      this.panel.classList.remove('chat-panel--sending');
    }
  }

  // Poll until assistant message appears after send
  private async waitForAssistantReply(): Promise<void> {
    const before = this.messages.filter((m) => m.role === 'assistant').length;

    for (let i = 0; i < 8; i += 1) {
      await this.refreshMessages();
      const after = this.messages.filter((m) => m.role === 'assistant').length;
      if (after > before) {
        return;
      }
      await new Promise((r) => window.setTimeout(r, POLL_MS));
    }
  }

  // Load messages from API
  private async refreshMessages(): Promise<void> {
    const data = await apiGetMessages(this.chatToken);
    this.messages = data.messages;
    this.render();
  }

  // Paint history + follow-up chips
  private render(): void {
    this.historyEl.innerHTML = this.messages
      .map((msg) => {
        const mod = msg.temp ? ' chat-history__item--temp' : '';
        const role = msg.role === 'user' ? 'chat-history__item--user' : 'chat-history__item--assistant';
        const chips =
          msg.followUps && msg.followUps.length
            ? `<div class="chat-history__chips">${msg.followUps
                .map((c) => `<button type="button" class="chat-history__chip" data-chip="${c}">${c}</button>`)
                .join('')}</div>`
            : '';

        return `<article class="chat-history__item ${role}${mod}"><p class="chat-history__text">${msg.text}</p>${chips}</article>`;
      })
      .join('');

    this.historyEl.querySelectorAll<HTMLButtonElement>('[data-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-chip') ?? '';
        this.onFollowUp(text);
      });
    });

    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }
}
