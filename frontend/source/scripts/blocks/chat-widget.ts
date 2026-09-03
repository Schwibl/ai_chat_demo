import { MessageService } from '../features/message-service';

// Build host shell, open button, chat panel DOM; wire open/close
export function mountChatWidget(root: HTMLElement): void {
  root.innerHTML = `
    <div class="host-page">
      <h1 class="host-page__title">Example site page</h1>
      <p class="host-page__text">The chat widget below mirrors an embeddable production pattern: floating trigger, panel, mock REST, optimistic send.</p>
    </div>
    <button type="button" class="button button--with-text button--accent chat-open-button" data-action="open-chat" aria-label="Open chat">Chat</button>
    <div class="chat-panel-backdrop" data-state="closed" aria-hidden="true"></div>
    <aside class="chat-panel" data-state="closed">
      <header class="chat-panel__header">
        <span class="chat-panel__title">Assistant</span>
        <button type="button" class="button button--transparent button--icon" data-action="toggle-size" aria-label="Expand panel" title="Expand">⛶</button>
        <button type="button" class="button button--transparent button--icon" data-action="close-chat" aria-label="Close chat" title="Close">×</button>
      </header>
      <div class="chat-panel__body chat-history" data-slot="history"></div>
      <footer class="chat-panel__footer">
        <textarea class="textarea textarea--compact" data-slot="message-input" rows="2" placeholder="Message…"></textarea>
        <button type="button" class="button button--transparent" data-action="send" aria-label="Send message" title="Send">→</button>
      </footer>
    </aside>
  `;

  const panel = root.querySelector<HTMLElement>('.chat-panel');
  const backdrop = root.querySelector<HTMLElement>('.chat-panel-backdrop');
  const history = root.querySelector<HTMLElement>('[data-slot="history"]');
  const openBtn = root.querySelector<HTMLButtonElement>('[data-action="open-chat"]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-action="close-chat"]');
  const sendBtn = root.querySelector<HTMLButtonElement>('[data-action="send"]');
  const input = root.querySelector<HTMLTextAreaElement>('[data-slot="message-input"]');
  const sizeBtn = root.querySelector<HTMLButtonElement>('[data-action="toggle-size"]');

  if (!panel || !history || !backdrop) {
    return;
  }

  const service = new MessageService(panel, history, (text) => {
    void service.send(text);
  });

  // Sync expand/compact glyph and accessible name with panel size modifier
  const updateSizeButton = (): void => {
    if (!sizeBtn) {
      return;
    }
    const isFull = panel.classList.contains('chat-panel--size-full');
    sizeBtn.textContent = isFull ? '⧉' : '⛶';
    sizeBtn.setAttribute('aria-label', isFull ? 'Compact panel' : 'Expand panel');
    sizeBtn.setAttribute('title', isFull ? 'Compact' : 'Expand');
  };

  // Show panel and dim overlay
  const open = (): void => {
    panel.classList.add('chat-panel--opened');
    panel.dataset.state = 'open';
    backdrop.classList.add('chat-panel-backdrop--visible');
    backdrop.dataset.state = 'open';
    backdrop.setAttribute('aria-hidden', 'false');
    void service.start();
  };

  // Hide panel and overlay (outside click, close button, etc.)
  const close = (): void => {
    panel.classList.remove('chat-panel--opened');
    panel.dataset.state = 'closed';
    backdrop.classList.remove('chat-panel-backdrop--visible');
    backdrop.dataset.state = 'closed';
    backdrop.setAttribute('aria-hidden', 'true');
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  sizeBtn?.addEventListener('click', () => {
    panel.classList.toggle('chat-panel--size-full');
    panel.classList.toggle('chat-panel--size-basic');
    updateSizeButton();
  });

  sendBtn?.addEventListener('click', () => {
    if (input) {
      void service.send(input.value);
      input.value = '';
    }
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendBtn?.click();
    }
  });
}
