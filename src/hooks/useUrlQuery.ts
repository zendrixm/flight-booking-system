import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * The URL's query string as page state. Every update starts from the live URL (never a value
 * captured at the last render) and commits synchronously, so quick successive changes are never
 * lost and inputs bound to the URL keep up with typing. Updates replace the history entry.
 */
export function useUrlQuery() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateQuery = useCallback(
    (apply: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(window.location.search);
      apply(next);
      setSearchParams(next, { replace: true, preventScrollReset: true, flushSync: true });
    },
    [setSearchParams],
  );

  return [searchParams, updateQuery] as const;
}

/** Sets `key`, or removes it when the value is empty or the default. */
export function setOrDelete(params: URLSearchParams, key: string, value: string | null, defaultValue = '') {
  if (value && value !== defaultValue) params.set(key, value);
  else params.delete(key);
}
