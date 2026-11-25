import { useId, type ReactNode } from 'react';

import styles from './DsSection.module.css';

interface DsSectionProps {
  /** "01 · Color" */
  eyebrow: string;
  title: string;
  /** A short note beside the title on wide screens. */
  aside?: ReactNode;
  children: ReactNode;
}

/** A numbered section of the design-system page. */
export function DsSection({ eyebrow, title, aside, children }: DsSectionProps) {
  const titleId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        </div>
        {aside && <p className={styles.aside}>{aside}</p>}
      </div>
      {children}
    </section>
  );
}

/** A titled panel inside a section: "Buttons", "Text fields", "Radius". */
export function DsPanel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}
