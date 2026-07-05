import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 320);
  }, []);

  const addToast = useCallback((type, message, title = '', duration = 4000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, type, message, title, removing: false }]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, title) => addToast('success', msg, title),
    error:   (msg, title) => addToast('error',   msg, title),
    warning: (msg, title) => addToast('warning', msg, title),
    info:    (msg, title) => addToast('info',    msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-label="Notifications">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.removing ? 'removing' : ''}`}
            role="alert"
          >
            <span className="toast-icon">{ICONS[t.type]}</span>
            <div className="toast-body">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-message">{t.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
