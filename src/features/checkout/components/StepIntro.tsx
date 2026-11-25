import type { ReactNode } from 'react';

import styles from './StepIntro.module.css';

interface StepIntroProps {
  title: string;
  children: ReactNode;
}

/** The serif step title and its one-line explanation. */
export function StepIntro({ title, children }: StepIntroProps) {
  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{children}</p>
    </div>
  );
}
