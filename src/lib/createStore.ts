import { useSyncExternalStore } from 'react';

import { readStoredValue, writeStoredValue } from './storage';

export interface Store<State> {
  getState: () => State;
  setState: (update: State | ((previous: State) => State)) => void;
  subscribe: (listener: () => void) => () => void;
  /** Re-renders the component when the selected slice changes. Select stable values (not new objects). */
  useStore: <Selected>(selector: (state: State) => Selected) => Selected;
}

interface StoreOptions {
  /** Persist to sessionStorage under this key so a refresh keeps the state. */
  persistKey?: string;
}

/**
 * A tiny external store for state that outlives a single component tree (e.g. checkout progress
 * shared by the results page and every checkout step). Built on `useSyncExternalStore`.
 */
export function createStore<State>(initialState: State, { persistKey }: StoreOptions = {}): Store<State> {
  let state = persistKey ? readStoredValue('session', persistKey, initialState) : initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState: Store<State>['setState'] = (update) => {
    const next = typeof update === 'function' ? (update as (previous: State) => State)(state) : update;
    if (Object.is(next, state)) return;
    state = next;
    if (persistKey) writeStoredValue('session', persistKey, state);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function useStore<Selected>(selector: (current: State) => Selected): Selected {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state),
    );
  }

  return { getState, setState, subscribe, useStore };
}
