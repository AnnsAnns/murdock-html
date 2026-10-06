import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const notify = useCallback((message, variant = 'info') => {
    const id = (nextId.current += 1);
    setToasts((list) => [...list, { id, message, variant }]);
    setTimeout(() => setToasts((list) => list.filter((toast) => toast.id !== id)), 6000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.variant === 'danger' ? 'is-danger' : 'is-info'}`}
          >
            <Icon name={toast.variant === 'danger' ? 'cross' : 'info'} className="toast-icon" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
