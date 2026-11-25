import { IconButton } from '@/components/ui';

import styles from './DayPager.module.css';

interface DayPagerProps {
  /** "Today · Fri 9 Oct" */
  label: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/** Steps through the operating days the airline feeds cover. The day is announced as it changes. */
export function DayPager({ label, canGoBack, canGoForward, onPrevious, onNext }: DayPagerProps) {
  return (
    <div role="group" aria-label="Day" className={styles.pager}>
      <IconButton
        icon="chevronLeft"
        label="Previous day"
        variant="outline"
        shape="square"
        disabled={!canGoBack}
        onClick={onPrevious}
      />
      <span aria-live="polite" className={styles.day}>
        {label}
      </span>
      <IconButton
        icon="chevronRight"
        label="Next day"
        variant="outline"
        shape="square"
        disabled={!canGoForward}
        onClick={onNext}
      />
    </div>
  );
}
