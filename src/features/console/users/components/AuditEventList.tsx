import clsx from 'clsx';

import type { AuditEvent } from '@/types/console/team';

import styles from './AuditEventList.module.css';

/** Audit entries with a coloured dot for the kind of change. */
export function AuditEventList({ events }: { events: readonly AuditEvent[] }) {
  return (
    <ol className={styles.list}>
      {events.map((event) => (
        <li key={event.id} className={styles.event}>
          <span aria-hidden="true" className={clsx(styles.dot, styles[event.tone])} />
          <span className={styles.text}>
            <span>
              <strong>{event.actor}</strong> {event.action}
            </span>
            <span className={styles.when}>{event.when}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
