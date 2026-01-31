'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import type { Toast as ToastType } from '@/types';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
} as const;

const styleMap = {
  success: 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300',
  error: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300',
  info: 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
} as const;

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
} as const;

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastType;
  onClose: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const Icon = iconMap[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));

    // Start exit animation before auto-dismiss
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 4500);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 200);
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 w-80 p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm transition-all duration-200',
        styleMap[toast.type],
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColorMap[toast.type])} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Fermer la notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
