import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ToastItem } from '../components/ToastItem';
import type { Toast } from '../types/types';

type AddToastInput = Omit<Toast, 'id'>;

interface ToastContextValue {
  addToast: (toast: AddToastInput) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3000;

const createToastId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: AddToastInput) => {
    setToasts((prev) => {
      const duplicate = prev.find(
        (item) => item.message === toast.message && item.type === toast.type
      );

      const nextToast: Toast = {
        id: createToastId(),
        message: toast.message,
        type: toast.type,
        duration: toast.duration ?? DEFAULT_DURATION,
      };

      if (duplicate) {
        return prev.map((item) =>
          item.id === duplicate.id ? nextToast : item
        );
      }

      return [...prev, nextToast];
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-list" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};