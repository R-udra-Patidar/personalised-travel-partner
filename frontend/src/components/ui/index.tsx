import { useState, createContext, useContext, type ReactNode } from 'react';

/* ── Toast Context ────────────────────────────────────────── */
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{icons[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Spinner ──────────────────────────────────────────────── */
export function Spinner({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />;
}

/* ── LoadingScreen ────────────────────────────────────────── */
export function LoadingScreen({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loading-screen">
      <Spinner size="lg" />
      <span>{text}</span>
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────── */
export function Badge({
  children,
  variant = 'teal',
}: {
  children: ReactNode;
  variant?: 'teal' | 'gold' | 'blue' | 'purple' | 'green' | 'demo';
}) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
