import { useEffect, useState } from 'react';

import { searchConsole } from '@/services/console/consoleShellService';
import type { ConsoleSearchGroup } from '@/types/console/search';

const DEBOUNCE_MS = 120;

interface ConsoleSearchState {
  /** The query the groups belong to, so stale results are never shown for a newer query. */
  query: string;
  groups: ConsoleSearchGroup[];
}

/** Debounced console search. `groups` is empty for a blank query. */
export function useConsoleSearch(query: string): { groups: ConsoleSearchGroup[]; isLoading: boolean } {
  const [state, setState] = useState<ConsoleSearchState>({ query: '', groups: [] });
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return undefined;
    let isCurrent = true;
    const timer = window.setTimeout(() => {
      searchConsole(trimmed).then((groups) => {
        if (isCurrent) setState({ query: trimmed, groups });
      });
    }, DEBOUNCE_MS);
    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  if (!trimmed) return { groups: [], isLoading: false };
  return { groups: state.query === trimmed ? state.groups : [], isLoading: state.query !== trimmed };
}

/** Splits `text` around the first case-insensitive match of `query`, for highlighting. */
export function splitOnMatch(text: string, query: string): { before: string; match: string; after: string } {
  const needle = query.trim().toLowerCase();
  const at = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (at < 0) return { before: text, match: '', after: '' };
  return {
    before: text.slice(0, at),
    match: text.slice(at, at + needle.length),
    after: text.slice(at + needle.length),
  };
}
