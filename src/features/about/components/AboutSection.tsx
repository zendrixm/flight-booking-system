import type { ReactNode } from 'react';

import styles from './AboutSection.module.css';

interface AboutSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/** A titled band of the About page: serif heading, then content. */
export function AboutSection({ id, title, children }: AboutSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
