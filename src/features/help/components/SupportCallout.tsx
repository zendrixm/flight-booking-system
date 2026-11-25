import { Button } from '@/components/ui';

import { useHelpSupport } from '../state/helpSupportContext';
import styles from './SupportCallout.module.css';

interface SupportCalloutProps {
  title: string;
  detail: string;
  /** `wide` lays the buttons beside the text, for the end of a page. */
  layout?: 'card' | 'wide';
  showOnlineStatus?: boolean;
  includeCallback?: boolean;
}

/** A Midnight panel offering chat and a message (and optionally a call back). */
export function SupportCallout({
  title,
  detail,
  layout = 'card',
  showOnlineStatus,
  includeCallback,
}: SupportCalloutProps) {
  const { openChat, openMessage, openCallback } = useHelpSupport();
  return (
    <aside className={layout === 'wide' ? styles.wide : styles.card}>
      <span className={styles.text}>
        {showOnlineStatus && (
          <span className={styles.online}>
            <span className={styles.onlineDot} aria-hidden="true" />
            Online · about 2 min
          </span>
        )}
        <span className={styles.title}>{title}</span>
        <span className={styles.detail}>{detail}</span>
      </span>
      <span className={styles.actions}>
        <Button variant="inverse" size="large" fullWidth={layout === 'card'} onClick={openChat}>
          Chat with us
        </Button>
        {includeCallback && (
          <Button variant="inverseQuiet" size="large" onClick={openCallback}>
            Request a call back
          </Button>
        )}
        <Button
          variant="inverseQuiet"
          size="large"
          fullWidth={layout === 'card'}
          onClick={() => openMessage()}
        >
          Write to us
        </Button>
      </span>
    </aside>
  );
}
