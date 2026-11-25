import type { StatusTone } from '@/components/ui';

export type ConsoleSearchKind = 'booking' | 'customer' | 'flight';

export interface ConsoleSearchResult {
  id: string;
  kind: ConsoleSearchKind;
  title: string;
  meta: string;
  status: { label: string; tone: StatusTone };
  /** Other words that should find this result, e.g. traveler names and e-ticket numbers. */
  keywords: string;
}

export interface ConsoleSearchGroup {
  kind: ConsoleSearchKind;
  label: string;
  /** All matches in this group; only the best few are in `results`. */
  total: number;
  results: ConsoleSearchResult[];
}
