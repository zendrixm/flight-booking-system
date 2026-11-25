import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { useNow } from '@/hooks';

import styles from './HoldTimer.module.css';

interface HoldTimerProps {
  expiresAt: number;
}

function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

/** "We're holding this fare for 19:42". Screen readers aren't interrupted every second. */
export function HoldTimer({ expiresAt }: HoldTimerProps) {
  const now = useNow(1000);
  const remaining = expiresAt - now;

  if (remaining <= 0) {
    return (
      <div className={styles.expired} role="alert">
        <Icon name="clock" size={16} />
        <span>
          Your fare hold has ended, so the price may change.{' '}
          <Link to={paths.flights} className={styles.link}>
            Check the latest fares
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.timer} role="timer" aria-live="off">
      <Icon name="clock" size={16} />
      <span>
        We’re holding this fare for <strong className={styles.clock}>{formatCountdown(remaining)}</strong>
      </span>
    </div>
  );
}
