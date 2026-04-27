import { storage } from '../lib/storage';
import type { NotificationDto } from '../types/notification';

type OnMessage = (notification: NotificationDto) => void;
type OnError = (event: Event) => void;

export function createNotificationsEventSource(
  onMessage: OnMessage,
  onError?: OnError
) {
  const token = storage.getToken();
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5101/api';

  if (!token) {
    throw new Error('No auth token available for notifications stream.');
  }

  const url = `${baseUrl}/notifications/stream?access_token=${encodeURIComponent(token)}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener('notification', (event) => {
    try {
      const data = JSON.parse((event as MessageEvent).data) as NotificationDto;
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse notification SSE payload:', error);
    }
  });

  eventSource.onerror = (event) => {
    console.error('Notifications SSE connection error:', event);
    onError?.(event);
  };

  return eventSource;
}