import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationHost, setNotificationHost] = useState(null);
  const timers = useRef(new Map());

  function dismiss(id) {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  }

  function notify(message, type = 'success') {
    const id = crypto.randomUUID();
    setNotifications((current) => [...current, { id, message, type }]);
    if (type !== 'error')
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 6000),
      );
  }

  useEffect(() => {
    const currentTimers = timers.current;
    return () => currentTimers.forEach(clearTimeout);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, setNotificationHost }}>
      {children}
      {createPortal(
        <div className="notifications" role="region" aria-label="Notificaciones">
          {notifications.map(({ id, message, type }) => (
            <div
              key={id}
              className={`toast toast-${type}`}
              role={type === 'error' ? 'alert' : 'status'}
            >
              {type === 'error' ? (
                <CircleAlert size={21} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={21} aria-hidden="true" />
              )}
              <p>{message}</p>
              <button
                className="icon-button"
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Cerrar notificación"
                title="Cerrar notificación"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>,
        notificationHost || document.body,
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
