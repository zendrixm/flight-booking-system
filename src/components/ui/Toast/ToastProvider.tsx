import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import { Spinner } from '../Spinner';
import styles from './Toast.module.css';
import { ToastContext, type ToastApi, type ToastOptions, type ToastTone } from './toastContext';

interface ActiveToast extends ToastOptions {
  id: string;
  tone: ToastTone;
}

const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION_MS = 4000;
const LONG_DURATION_MS = 6000;

const TONE_ICON: Partial<Record<ToastTone, IconName>> = {
  success: 'check',
  info: 'info',
  warning: 'alertTriangle',
  error: 'alertCircle',
};

function resolveDuration(toast: ToastOptions): number | null {
  if (toast.duration !== undefined) return toast.duration;
  if (toast.tone === 'error' || toast.tone === 'loading') return null;
  if (toast.action || toast.tone === 'warning') return LONG_DURATION_MS;
  return DEFAULT_DURATION_MS;
}

let toastSequence = 0;

/** Bottom-centre toasts shared by the customer site and the console. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const schedule = useCallback(
    (toast: ActiveToast) => {
      const duration = resolveDuration(toast);
      if (duration === null) return;
      clearTimeout(timers.current.get(toast.id));
      timers.current.set(
        toast.id,
        setTimeout(() => dismiss(toast.id), duration),
      );
    },
    [dismiss],
  );

  const show = useCallback(
    (options: ToastOptions) => {
      toastSequence += 1;
      const id = options.key ?? `toast-${toastSequence}`;
      const toast: ActiveToast = { ...options, id, tone: options.tone ?? 'success' };

      setToasts((current) => {
        const withoutDuplicate = current.filter((existing) => existing.id !== id);
        return [...withoutDuplicate, toast].slice(-MAX_VISIBLE_TOASTS);
      });
      schedule(toast);
      return id;
    },
    [schedule],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.viewport}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={clsx(styles.toast, styles[toast.tone])}
            onMouseEnter={() => clearTimeout(timers.current.get(toast.id))}
            onMouseLeave={() => schedule(toast)}
            onFocus={() => clearTimeout(timers.current.get(toast.id))}
            onBlur={() => schedule(toast)}
          >
            {toast.tone === 'loading' ? (
              <Spinner size={16} className={styles.icon} />
            ) : (
              <Icon
                name={TONE_ICON[toast.tone] ?? 'check'}
                size={18}
                strokeWidth={2}
                className={styles.icon}
              />
            )}
            <span className={styles.message}>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              className={styles.close}
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <Icon name="close" size={14} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
