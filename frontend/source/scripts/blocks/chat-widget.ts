import { MessageService } from '../features/message-service';

// Stroke icons inherit the button color; aria-hidden because the button has the name
const ICON_EXPAND =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const ICON_COMPACT =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
const ICON_CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_SEND =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>';

// Build host shell, open button, chat panel DOM; wire open/close
export function mountChatWidget(root: HTMLElement): void {
  root.innerHTML = `
    <main class="host-page">
      <h1 class="host-page__title">Example site page</h1>
      <p class="host-page__text">The chat widget below mirrors an embeddable production pattern: floating trigger, panel, mock REST, optimistic send.</p>
    </main>
    <aside class="chat-widget" aria-label="Chat">
      <button type="button" class="button button--with-text button--accent chat-open-button" data-action="open-chat" aria-label="Open chat" aria-expanded="false" aria-controls="chat-panel">Chat</button>
      <div class="chat-panel-backdrop" data-state="closed" aria-hidden="true"></div>
      <div id="chat-panel" class="chat-panel" data-state="closed" inert>
        <header class="chat-panel__header">
          <span class="chat-panel__title">Assistant</span>
          <button type="button" class="button button--transparent button--icon" data-action="toggle-size" aria-label="Expand panel" title="Expand">${ICON_EXPAND}</button>
          <button type="button" class="button button--transparent button--icon" data-action="close-chat" aria-label="Close chat" title="Close">${ICON_CLOSE}</button>
        </header>
        <div class="chat-panel__body chat-history" data-slot="history" role="log" aria-live="polite" aria-relevant="additions"></div>
        <footer class="chat-panel__footer">
          <textarea class="textarea textarea--compact" data-slot="message-input" rows="2" placeholder="Message…" aria-label="Message"></textarea>
          <button type="button" class="button button--transparent" data-action="send" aria-label="Send message" title="Send" disabled>${ICON_SEND}</button>
        </footer>
      </div>
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

  // Property, not only the attribute: innerHTML has dropped `inert` in some engines
  panel.inert = true;

  const service = new MessageService(panel, history, (text) => {
    void service.send(text);
  });

  // Empty field cannot send; disabled color is raised in the panel styles
  const syncSendButton = (): void => {
    if (!sendBtn || !input) {
      return;
    }
    sendBtn.disabled = input.value.trim().length === 0 || service.isSending();
  };

  // Sync expand/compact glyph and accessible name with panel size modifier
  const updateSizeButton = (): void => {
    if (!sizeBtn) {
      return;
    }
    const isFull = panel.classList.contains('chat-panel--size-full');
    sizeBtn.innerHTML = isFull ? ICON_COMPACT : ICON_EXPAND;
    sizeBtn.setAttribute('aria-label', isFull ? 'Compact panel' : 'Expand panel');
    sizeBtn.setAttribute('title', isFull ? 'Compact' : 'Expand');
  };

  // Show panel, move focus into the field, and dim overlay
  const open = (): void => {
    panel.inert = false;
    panel.classList.add('chat-panel--opened');
    panel.dataset.state = 'open';
    openBtn?.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('chat-panel-backdrop--visible');
    backdrop.dataset.state = 'open';
    backdrop.setAttribute('aria-hidden', 'false');
    input?.focus({ preventScroll: true });
    void service.start();
  };

  // Hide panel from pointer, keyboard, and AT; return focus to the launcher
  const close = (): void => {
    panel.classList.remove('chat-panel--opened');
    panel.dataset.state = 'closed';
    panel.inert = true;
    openBtn?.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('chat-panel-backdrop--visible');
    backdrop.dataset.state = 'closed';
    backdrop.setAttribute('aria-hidden', 'true');
    openBtn?.focus({ preventScroll: true });
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  // Esc closes while the panel is open (textarea used to swallow it)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.dataset.state === 'open') {
      event.preventDefault();
      close();
    }
  });

  sizeBtn?.addEventListener('click', () => {
    panel.classList.toggle('chat-panel--size-full');
    panel.classList.toggle('chat-panel--size-basic');
    updateSizeButton();
  });

  // Clear only after the service accepts the text, so a busy send does not drop it
  const submit = (): void => {
    if (!input || service.isSending() || input.value.trim().length === 0) {
      return;
    }
    const text = input.value;
    input.value = '';
    syncSendButton();
    void service.send(text);
  };

  sendBtn?.addEventListener('click', submit);
  input?.addEventListener('input', syncSendButton);

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });
}
