import { apiGetMessages, apiInit, apiSendMessage } from '../api/chat-api';

const TOKEN_KEY = 'portfolio-chat-token';
const POLL_MS = 3000;
const SEND_ERROR = "Couldn't get a reply.";
const EMPTY_HINT = 'Hi. Ask anything.';
const EMPTY_CHIPS = ['What can you do?', 'How is this built?', 'Show an example'];

// innerHTML paint: escape so a message cannot become markup
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Chat widget state and lifecycle
export class MessageService {
  private chatToken = '';
  private messages: t_Message[] = [];
  private sendInProgress = false;
  private waitingForAssistant = false;
  private sendError = '';
  private lastFailedText = '';

  constructor(
    private panel: HTMLElement,
    private historyEl: HTMLElement,
    private onFollowUp: (text: string) => void,
  ) {}

  // Widget checks this before clearing the textarea
  isSending(): boolean {
    return this.sendInProgress;
  }

  // Boot: init API + first history load. Missing API must not reject uncaught.
  async start(): Promise<void> {
    this.panel.classList.add('chat-panel--loading');
    this.panel.classList.remove('chat-panel--error');
    this.sendError = '';

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
      '<article class="chat-history__item chat-history__item--assistant"><p class="chat-history__text">Chat API is not available. This demo uses a local mock server — run npm run dev or npm run preview. No API key is required.</p><button type="button" class="button button--transparent button--with-text" data-action="retry">Retry</button></article>';
    this.historyEl.querySelector<HTMLButtonElement>('[data-action="retry"]')?.addEventListener('click', () => {
      void this.start();
    });
  }

  // Send with optimistic temp bubble. Typing stays up until a reply or a failure.
  async send(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || this.sendInProgress) {
      return;
    }

    this.sendInProgress = true;
    this.sendError = '';
    this.lastFailedText = trimmed;
    this.waitingForAssistant = true;
    this.panel.classList.remove('chat-panel--error');
    this.panel.classList.add('chat-panel--sending');

    const tempId = `temp-${Date.now()}`;
    this.messages = this.messages.filter((message) => !(message.temp && message.text === trimmed));
    this.messages.push({ id: tempId, role: 'user', text: trimmed, temp: true });
    this.render();

    try {
      if (!this.chatToken) {
        throw new Error('no session');
      }
      await apiSendMessage(this.chatToken, trimmed);
      await this.waitForAssistantReply();
    } catch {
      this.sendError = SEND_ERROR;
      this.panel.classList.add('chat-panel--error');
    } finally {
      this.sendInProgress = false;
      this.waitingForAssistant = false;
      this.panel.classList.remove('chat-panel--sending');
      this.render();
    }
  }

  // Poll getMessages until a new assistant reply appears
  private async waitForAssistantReply(): Promise<void> {
    const assistantCountBefore = this.messages.filter((message) => message.role === 'assistant').length;

    for (let i = 0; i < 8; i += 1) {
      await this.refreshMessages();

      const assistantCountAfter = this.messages.filter((message) => message.role === 'assistant').length;
      const last = this.messages[this.messages.length - 1];

      if (assistantCountAfter > assistantCountBefore && last?.role === 'assistant') {
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, POLL_MS));
    }

    throw new Error('no reply');
  }

  // Load messages from API
  private async refreshMessages(): Promise<void> {
    const data = await apiGetMessages(this.chatToken);
    this.messages = data.messages;
    this.render();
  }

  // Whether to show the preparing row after real messages
  private shouldShowTyping(): boolean {
    if (!this.waitingForAssistant || this.sendError) {
      return false;
    }

    const last = this.messages[this.messages.length - 1];
    return !last || last.role !== 'assistant';
  }

  // Paint history, follow-up chips, typing row, and send error
  private render(): void {
    const source = this.messages.length
      ? this.messages
      : [{ id: 'empty', role: 'assistant' as const, text: EMPTY_HINT, followUps: EMPTY_CHIPS }];

    const rows = source
      .map((msg) => {
        const mod = msg.temp ? ' chat-history__item--temp' : '';
        const role = msg.role === 'user' ? 'chat-history__item--user' : 'chat-history__item--assistant';
        const chips =
          msg.followUps && msg.followUps.length
            ? `<div class="chat-history__chips">${msg.followUps
                .map(
                  (chip) =>
                    `<button type="button" class="button button--transparent button--with-text" data-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`,
                )
                .join('')}</div>`
            : '';

        return `<article class="chat-history__item ${role}${mod}"><p class="chat-history__text">${escapeHtml(msg.text)}</p>${chips}</article>`;
      })
      .join('');

    const typing = this.shouldShowTyping()
      ? '<article class="chat-history__item chat-history__item--assistant chat-history__item--typing"><p class="chat-history__text">Preparing<span class="chat-history__dots" aria-hidden="true"></span></p></article>'
      : '';

    const error = this.sendError
      ? `<div class="chat-history__error" role="alert"><p class="chat-history__text">${escapeHtml(this.sendError)}</p><button type="button" class="button button--transparent button--with-text" data-action="retry">Retry</button></div>`
      : '';

    this.historyEl.innerHTML = rows + typing + error;

    this.historyEl.querySelectorAll<HTMLButtonElement>('[data-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chip = btn.getAttribute('data-chip') ?? '';
        this.onFollowUp(chip);
      });
    });

    this.historyEl.querySelector<HTMLButtonElement>('[data-action="retry"]')?.addEventListener('click', () => {
      void this.send(this.lastFailedText);
    });

    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }
}
