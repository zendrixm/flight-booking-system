import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

import styles from './ConsolePanel.module.css';

interface ConsolePanelProps {
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** Short note or link on the right of the title row. */
  aside?: ReactNode;
  /** `flush` lets rows and tables run to the panel edges; `padded` keeps content inside 24px. */
  layout?: 'padded' | 'flush';
  className?: string;
  children: ReactNode;
}

/** A white console card with a 16px title row. */
export function ConsolePanel({
  title,
  description,
  aside,
  layout = 'padded',
  className,
  children,
}: ConsolePanelProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={clsx(styles.panel, styles[layout], className)}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
      {children}
    </section>
  );
}
