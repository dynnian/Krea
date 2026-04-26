import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '../lib/axios';

// Interfaz que refleja la tabla notification de la BD
export interface Notification {
  id: number;               // bigint (en JS cabe como número)
  userId: number;           // bigint FK
  activityId: number;       // bigint FK
  content: string;          // varchar(256)
  type: string;             // enum (lo manejamos como string)
  createdAt: string;        // timestamp (ISO string desde backend)
  read?: boolean;           // ⚠️ No está en la BD, lo agregamos para UI (lo manejamos localmente)
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5101/api';

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Cargar notificaciones iniciales y conectar SSE cuando el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setLoading(false);
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
      return;
    }

    const fetchNotifications = async () => {
      try {
        // Ajusta la URL según tu backend (ej. /notifications)
        const response = await axiosClient.get('/notifications');
        // Asumimos que el backend devuelve un array de notificaciones
        // Si no incluye campo 'read', lo inicializamos como false
        const notifs = response.data.map((n: any) => ({ ...n, read: false }));
        setNotifications(notifs);
      } catch (error) {
        console.error('Error al cargar notificaciones', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Configurar Server-Sent Events
    // Usamos userId como parámetro; el backend debería validar la autenticación
    const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
    const streamUrl = `${normalizedApiBaseUrl}/notifications/stream?userId=${encodeURIComponent(user.id)}`;
    const es = new EventSource(streamUrl);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Asumimos que el backend envía una notificación con la misma estructura
        const newNotification: Notification = { ...data, read: false };
        setNotifications(prev => [newNotification, ...prev]);
      } catch (e) {
        console.error('Error parsing SSE message', e);
      }
    };

    es.onerror = () => {
      console.error('SSE connection error, closing');
      es.close();
    };

    setEventSource(es);

    return () => {
      es.close();
    };
  }, [isAuthenticated, user]);

  // Calcular no leídas (basado en el campo local 'read')
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // Opcional: llamar a la API para persistir el estado de leído
    // axiosClient.patch(`/notifications/${id}/read`);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    // Opcional: llamar a la API para marcar todas como leídas
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
};