import React, { useEffect } from 'react';
import { CheckCircle, Info } from 'lucide-react';

export default function Notification({ notifications, removeNotification }) {
  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <Toast
          key={notif.id}
          notification={notif}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
}

function Toast({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${notification.type || 'success'}`} onClick={onClose}>
      {notification.type === 'info' ? (
        <Info size={20} className="toast-icon" />
      ) : (
        <CheckCircle size={20} className="toast-icon" />
      )}
      <span className="toast-message">{notification.message}</span>
    </div>
  );
}
