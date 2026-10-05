import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from './Notifications.jsx';

export default function Modal({ title, children, onClose, busy = false, wide = false }) {
  const dialogRef = useRef(null);
  const headingId = useId();
  const { setNotificationHost } = useNotifications();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    setNotificationHost(dialog);
    document.body.style.overflow = 'hidden';
    return () => {
      setNotificationHost(null);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [setNotificationHost]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-labelledby={headingId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-heading">
          <h2 id={headingId}>{title}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar diálogo"
            title="Cerrar diálogo"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
