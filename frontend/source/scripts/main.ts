import '../styles/main.scss';
import { mountChatWidget } from './blocks/chat-widget';

// Mount host page shell, open button, and chat panel
const root = document.querySelector<HTMLElement>('#app');
if (root) {
  mountChatWidget(root);
}
