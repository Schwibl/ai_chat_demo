import { apiGetMessages, apiInit, apiSendMessage } from '../api/chat-api';

const TOKEN_KEY = 'portfolio-chat-token';
const POLL_MS = 3000;

// Chat widget state and lifecycle
export class MessageService {
  private chatToken = '';
  private messages: t_Message[] = [];
  private sendInProgress = false;
  private waitingForAssistant = false;

  constructor(
    private panel: HTMLElement,
    private historyEl: HTMLElement,
    private onFollowUp: (text: string) => void,
  ) {}

  // Boot: init API + first history load. Missing API must not reject uncaught.
  async start(): Promise<void> {
    this.panel.classList.add('chat-panel--loading');

    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        this.chatToken = stored;
      } else {
        const init = await apiInit();
        this.chatToken = init.chatToken;
        localStorage.setItem(TOKEN_KEY, this.chatToken);
      }

      await this.refreshMessages();
    } catch {
      this.panel.classList.add('chat-panel--error');
      this.showApiUnavailable();
    } finally {
      this.panel.classList.remove('chat-panel--loading');
    }
  }

  // Static hosts have no Vite mock plugin; say so instead of failing silently
  private showApiUnavailable(): void {
    this.historyEl.innerHTML =
      '<article class="chat-history__item chat-history__item--assistant"><p class="chat-history__text">Chat API is not available. This demo uses a local mock server — run npm run dev or npm run preview. No API key is required.</p></article>';
  }

  // Send with optimistic temp bubble
  async send(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || this.sendInProgress) {
      return;
    }

    this.sendInProgress = true;
    this.panel.classList.remove('chat-panel--error');
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

  // Poll getMessages until a new assistant reply appears
  private async waitForAssistantReply(): Promise<void> {
    const assistantCountBefore = this.messages.filter((m) => m.role === 'assistant').length;
    this.waitingForAssistant = true;
    this.render();

    try {
      for (let i = 0; i < 8; i += 1) {
        await this.refreshMessages();

        const assistantCountAfter = this.messages.filter((m) => m.role === 'assistant').length;
        const last = this.messages[this.messages.length - 1];

        if (assistantCountAfter > assistantCountBefore && last?.role === 'assistant') {
          return;
        }

        await new Promise((r) => window.setTimeout(r, POLL_MS));
      }
    } finally {
      this.waitingForAssistant = false;
      this.render();
    }
  }

  // Load messages from API
  private async refreshMessages(): Promise<void> {
    const data = await apiGetMessages(this.chatToken);
    this.messages = data.messages;
    this.render();
  }

  // Whether to show the preparing row after real messages
  private shouldShowTyping(): boolean {
    if (!this.waitingForAssistant) {
      return false;
    }

    const last = this.messages[this.messages.length - 1];
    return !last || last.role !== 'assistant';
  }

  // Paint history, follow-up chips, and optional typing row
  private render(): void {
    const rows = this.messages
      .map((msg) => {
        const mod = msg.temp ? ' chat-history__item--temp' : '';
        const role = msg.role === 'user' ? 'chat-history__item--user' : 'chat-history__item--assistant';
        const chips =
          msg.followUps && msg.followUps.length
            ? `<div class="chat-history__chips">${msg.followUps
                .map((c) => `<button type="button" class="button button--transparent button--with-text" data-chip="${c}">${c}</button>`)
                .join('')}</div>`
            : '';

        return `<article class="chat-history__item ${role}${mod}"><p class="chat-history__text">${msg.text}</p>${chips}</article>`;
      })
      .join('');

    const typing = this.shouldShowTyping()
      ? `<article class="chat-history__item chat-history__item--assistant chat-history__item--typing" aria-live="polite"><p class="chat-history__text">Preparing<span class="chat-history__dots" aria-hidden="true"></span></p></article>`
      : '';

    this.historyEl.innerHTML = rows + typing;

    this.historyEl.querySelectorAll<HTMLButtonElement>('[data-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-chip') ?? '';
        this.onFollowUp(text);
      });
    });

    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }
}
