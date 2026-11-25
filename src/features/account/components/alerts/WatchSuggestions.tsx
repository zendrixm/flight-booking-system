import { Button } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { WatchSuggestion } from '@/types/priceAlert';

import { cityOf } from '../../lib/priceAlerts';
import styles from './WatchSuggestions.module.css';

interface WatchSuggestionsProps {
  suggestions: WatchSuggestion[];
  onWatch: (suggestion: WatchSuggestion) => void;
}

export function WatchSuggestions({ suggestions, onWatch }: WatchSuggestionsProps) {
  return (
    <section aria-labelledby="suggestions-title" className={styles.section}>
      <div className={styles.heading}>
        <h2 id="suggestions-title" className={styles.title}>
          Suggested from your past trips
        </h2>
        <span className={styles.subtitle}>Lowest round-trip fares from Manila over the next 3 months.</span>
      </div>
      <div className={styles.grid}>
        {suggestions.map((suggestion) => (
          <div key={suggestion.to} className={styles.card}>
            <span className={styles.text}>
              <span className={styles.city}>{cityOf(suggestion.to)}</span>
              <span className={styles.detail}>
                {suggestion.from} ⇄ {suggestion.to} · from {formatPeso(suggestion.lowestFare)}
              </span>
            </span>
            <Button
              variant="secondary"
              size="small"
              iconStart="eye"
              aria-label={`Watch ${cityOf(suggestion.from)} to ${cityOf(suggestion.to)}`}
              onClick={() => onWatch(suggestion)}
            >
              Watch
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
