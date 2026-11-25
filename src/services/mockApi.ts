/**
 * The app talks to "services" only through async functions so a real HTTP API can replace the
 * mock implementations without touching components. Mock responses wait a little to keep
 * loading states honest.
 */

const DEFAULT_LATENCY_MS = 300;

function configuredLatency(): number {
  const fromEnv = Number(import.meta.env.VITE_MOCK_LATENCY_MS);
  return Number.isFinite(fromEnv) && fromEnv >= 0 ? fromEnv : DEFAULT_LATENCY_MS;
}

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/**
 * Resolves with `produce()` after the configured latency (or `latencyMs` for slow operations such as
 * payments); rejects if `produce` throws. Tests never wait.
 */
export function mockRequest<T>(produce: () => T, latencyMs?: number): Promise<T> {
  const delay = import.meta.env.MODE === 'test' ? 0 : (latencyMs ?? configuredLatency());
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(produce()));
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}
