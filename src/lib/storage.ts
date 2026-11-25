/**
 * Small wrappers around Web Storage. Storage can be unavailable (private windows, blocked
 * site data), so every access is guarded and falls back to the provided default.
 */

export function readStoredValue<T>(storage: 'local' | 'session', key: string, fallback: T): T {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage;
    const raw = store.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStoredValue(storage: 'local' | 'session', key: string, value: unknown): void {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage;
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is a convenience only; the app keeps working in memory.
  }
}
