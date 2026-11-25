import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error' | 'loading';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** One short verb, e.g. Undo, View, Retry. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it disappears. Defaults follow the design system: 4s, 6s with an action, errors stay. */
  duration?: number;
  /** Toasts with the same key replace each other instead of stacking. */
  key?: string;
}

export interface ToastApi {
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return api;
}
