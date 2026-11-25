import clsx from 'clsx';

import { Icon } from '@/components/icons';

import styles from './ProgressSteps.module.css';

export interface ProgressStep {
  label: string;
  status: 'done' | 'current' | 'upcoming';
}

/** A short vertical checklist of what's happening, e.g. while a payment goes through. */
export function ProgressSteps({ steps }: { steps: readonly ProgressStep[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step) => (
        <li key={step.label} className={clsx(styles.step, styles[step.status])}>
          <span className={styles.dot} aria-hidden="true">
            {step.status === 'done' && <Icon name="check" size={12} strokeWidth={3} />}
          </span>
          <span className={styles.label}>
            {step.label}
            <span className="visually-hidden">
              {step.status === 'done' ? ' (done)' : step.status === 'current' ? ' (in progress)' : ''}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
