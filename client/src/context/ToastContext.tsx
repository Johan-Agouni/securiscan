'use client';

import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import type { Toast } from '@/types';

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

let toastCounter = 0;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      const toast: Toast = { id, message, type };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
