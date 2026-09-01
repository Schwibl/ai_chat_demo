import { MessageService } from '../features/message-service';

// Build chat panel DOM and wire open/close
export function mountChatWidget(root: HTMLElement): void {
  root.innerHTML = `
    <div class="host-page">
      <h1 class="host-page__title">Example site page</h1>
      <p class="host-page__text">The chat widget below mirrors an embeddable production pattern: floating trigger, panel, mock REST, optimistic send.</p>
    </div>
    <button type="button" class="chat-open-button" data-action="open-chat" aria-label="Open chat">Chat</button>
    <aside class="chat-panel" data-state="closed">
      <header class="chat-panel__header">
        <span class="chat-panel__title">Assistant</span>
        <button type="button" class="chat-panel__size" data-action="toggle-size">Expand</button>
        <button type="button" class="chat-panel__close" data-action="close-chat">Close</button>
      </header>
      <div class="chat-panel__body chat-history" data-slot="history"></div>
      <footer class="chat-panel__footer">
        <textarea class="chat-panel__input" rows="2" placeholder="Message…"></textarea>
        <button type="button" class="chat-panel__send" data-action="send">Send</button>
      </footer>
    </aside>
  `;

  const panel = root.querySelector<HTMLElement>('.chat-panel');
  const history = root.querySelector<HTMLElement>('[data-slot="history"]');
  const openBtn = root.querySelector<HTMLButtonElement>('[data-action="open-chat"]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-action="close-chat"]');
  const sendBtn = root.querySelector<HTMLButtonElement>('[data-action="send"]');
  const input = root.querySelector<HTMLTextAreaElement>('.chat-panel__input');
  const sizeBtn = root.querySelector<HTMLButtonElement>('[data-action="toggle-size"]');

  if (!panel || !history) {
    return;
  }

  const service = new MessageService(panel, history, (text) => {
    void service.send(text);
  });

  const open = (): void => {
    panel.classList.add('chat-panel--opened');
    panel.dataset.state = 'open';
    void service.start();
  };

  const close = (): void => {
    panel.classList.remove('chat-panel--opened');
    panel.dataset.state = 'closed';
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  sizeBtn?.addEventListener('click', () => {
    panel.classList.toggle('chat-panel--size-full');
    panel.classList.toggle('chat-panel--size-basic');
    sizeBtn.textContent = panel.classList.contains('chat-panel--size-full') ? 'Compact' : 'Expand';
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
