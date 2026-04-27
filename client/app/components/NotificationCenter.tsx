import dayjs from '../lib/dayjs.ts';
import { useNotifications } from '../contexts/NotificationContext.tsx';
import './styles/NotificationsPanel.css';

type NotificationCenterProps = {
  open: boolean;
};

export default function NotificationCenter({ open }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (!open) return null;

  return (
    <div className="notifications-wrapper">
      <div className="notifications-panel">
        <div className="notifications-panel-header">
          <div>
            <h3>Notificaciones</h3>
            <small>Tiempo real activo</small>
          </div>

          <button
            type="button"
            className="krea-white-button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
          >
            Marcar todas
          </button>
        </div>

        <div className="notifications-panel-body">
          {notifications.length === 0 ? (
            <div className="notifications-empty">No tienes notificaciones.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-item-content">
                  <p>{notification.content}</p>
                  <small>{dayjs(notification.createdAt).fromNow()}</small>
                </div>

                <div className="notification-item-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      className="krea-save-button"
                      onClick={() => void markAsRead(notification.id)}
                    >
                      Leída
                    </button>
                  )}

                  {/* Lo dejamos oculto por ahora porque tu contexto no tiene removeNotification tipado */}
                  {/* 
                  <button
                    type="button"
                    className="krea-cancel-button"
                    onClick={() => void removeNotification(notification.id)}
                  >
                    Eliminar
                  </button>
                  */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}