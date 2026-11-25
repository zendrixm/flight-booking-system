/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Simulated latency for the mock API in milliseconds. */
  readonly VITE_MOCK_LATENCY_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
