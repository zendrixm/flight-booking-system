import type { ReactNode } from 'react';

import styles from './SettingsSection.module.css';

interface SettingsSectionProps {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

/** A settings group: title and explanation on the left, the controls on the right; stacked on phones. */
export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.section}>
      <div className={styles.meta}>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
