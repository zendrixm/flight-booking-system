import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

import styles from './PhoneScreen.module.css';

interface PhoneScreenProps {
  /** The screen's heading. Leave it out when `header` draws its own. */
  title?: ReactNode;
  /** Beside the title, e.g. "New alert". */
  actions?: ReactNode;
  /** Replaces the title row, e.g. the search screen's brand row. */
  header?: ReactNode;
  /** `loose` (24px) for the search screen's larger blocks; 16px otherwise. */
  spacing?: 'default' | 'loose';
  children: ReactNode;
}

/** One scrolling tab screen of the phone app: safe-area padding, a serif title and a column of blocks. */
export function PhoneScreen({ title, actions, header, spacing = 'default', children }: PhoneScreenProps) {
  return (
    <main className={clsx(styles.screen, spacing === 'loose' && styles.loose)}>
      {header}
      {title && (
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {actions}
        </div>
      )}
      {children}
    </main>
  );
}

interface PhoneSectionProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** A labelled group on a phone screen: "YOUR NEXT TRIP", "RECENT SEARCHES". */
export function PhoneSection({ label, children, className }: PhoneSectionProps) {
  const labelId = useId();
  return (
    <section className={clsx(styles.section, className)} aria-labelledby={labelId}>
      <h2 id={labelId} className={styles.sectionLabel}>
        {label}
      </h2>
      {children}
    </section>
  );
}
