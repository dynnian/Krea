import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import type {
  NotificationDto,
  NotificationPreferencesDto,
  UpdateNotificationPreferencesRequest,
} from '../types/notification';
import { notificationsService } from '../services/notificationsService';
import { createNotificationsEventSource } from '../services/notificationsStream';

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  preferences: NotificationPreferencesDto | null;
  isLoading: boolean;
  isConnecting: boolean;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (payload: UpdateNotificationPreferencesRequest) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferencesDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const refreshNotifications = useCallback(async () => {
    const data = await notificationsService.getMyNotifications(1, 20);
    setNotifications(data);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const count = await notificationsService.getUnreadCount();
    setUnreadCount(count);
  }, []);

  const refreshPreferences = useCallback(async () => {
    const data = await notificationsService.getPreferences();
    setPreferences(data);
  }, []);

  const loadAll = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await Promise.all([
        refreshNotifications(),
        refreshUnreadCount(),
        refreshPreferences(),
      ]);
    } catch (error) {
      console.error('Failed loading notifications data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, refreshNotifications, refreshUnreadCount, refreshPreferences]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);

    await notificationsService.markAsRead(notificationId);

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId
          ? { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() }
          : item
      )
    );

    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    await notificationsService.markAllAsRead();

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      }))
    );

    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback(async (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);

    await notificationsService.deleteNotification(notificationId);

    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));

    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [notifications]);

  const updatePreferences = useCallback(async (payload: UpdateNotificationPreferencesRequest) => {
    await notificationsService.updatePreferences(payload);
    await refreshPreferences();
  }, [refreshPreferences]);

  const cleanupStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connectStream = useCallback(() => {
    if (!isAuthenticated || !user) return;

    cleanupStream();
    setIsConnecting(true);

    try {
      const source = createNotificationsEventSource(
        (notification) => {
          setNotifications((prev) => {
            const exists = prev.some((item) => item.id === notification.id);
            if (exists) return prev;
            return [notification, ...prev];
          });

          setUnreadCount((prev) => prev + 1);
        },
        () => {
          setIsConnecting(false);

          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectStream();
          }, 3000);
        }
      );

      source.onopen = () => {
        setIsConnecting(false);
      };

      eventSourceRef.current = source;
    } catch (error) {
      console.error('Failed to initialize notifications stream:', error);
      setIsConnecting(false);

      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectStream();
      }, 3000);
    }
  }, [cleanupStream, isAuthenticated, user]);

  useEffect(() => {
    if (loading) return;
    void loadAll();
  }, [loading, loadAll]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      cleanupStream();
      return;
    }

    connectStream();

    return () => {
      cleanupStream();
    };
  }, [loading, isAuthenticated, user, connectStream, cleanupStream]);

  const value = useMemo<NotificationContextType>(() => ({
    notifications,
    unreadCount,
    preferences,
    isLoading,
    isConnecting,
    refreshNotifications,
    refreshUnreadCount,
    refreshPreferences,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updatePreferences,
  }), [
    notifications,
    unreadCount,
    preferences,
    isLoading,
    isConnecting,
    refreshNotifications,
    refreshUnreadCount,
    refreshPreferences,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updatePreferences,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}