import '../styles/main.scss';
import { mountChatWidget } from './blocks/chat-widget';

const root = document.querySelector<HTMLElement>('#app');
if (root) {
  mountChatWidget(root);
}
