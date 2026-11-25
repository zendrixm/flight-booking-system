import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type AsyncStatus = 'loading' | 'success' | 'error';

export interface AsyncData<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: Error | undefined;
  /** Runs the loader again, e.g. from a "Try again" button. */
  reload: () => void;
  /** Replaces the data without a request, e.g. with the fresh copy a save returned. */
  mutate: (data: T) => void;
}

/**
 * Loads data with `load` whenever `key` changes. Results from stale requests are ignored.
 * A small stand-in for a data-fetching library; swap for TanStack Query when the API is real.
 */
export function useAsyncData<T>(key: string, load: () => Promise<T>): AsyncData<T> {
  const loadRef = useRef(load);
  useLayoutEffect(() => {
    loadRef.current = load;
  });

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: AsyncStatus; data?: T; error?: Error }>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;
    setState((previous) => ({ status: 'loading', data: previous.data }));
    loadRef
      .current()
      .then((data) => {
        if (isCurrent) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);
  const mutate = useCallback((data: T) => setState({ status: 'success', data }), []);

  return { status: state.status, data: state.data, error: state.error, reload, mutate };
}
