import { useState } from 'react';
import dayjs from '../lib/dayjs';
import { useNotifications } from '../contexts/NotificationContext';
import './styles/NotificationsPanel.css';

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnecting,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [open, setOpen] = useState(false);

  return (
    <div className="notifications-wrapper">
      <button
        className="notifications-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Abrir notificaciones"
        type="button"
      >
        <span>🔔</span>
        {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notifications-panel">
          <div className="notifications-panel-header">
            <div>
              <h3>Notificaciones</h3>
              <small>{isConnecting ? 'Reconectando...' : 'Tiempo real activo'}</small>
            </div>

            <button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={!notifications.length}
            >
              Marcar todas
            </button>
          </div>

          <div className="notifications-panel-body">
            {isLoading ? (
              <div className="notifications-empty">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">No tienes notificaciones.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                >
                  <div className="notification-item-content">
                    <p>{notification.content}</p>
                    <small>{dayjs(notification.createdAt).fromNow()}</small>
                  </div>

                  <div className="notification-item-actions">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => void markAsRead(notification.id)}
                      >
                        Leída
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void removeNotification(notification.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}