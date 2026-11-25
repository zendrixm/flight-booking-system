import clsx from 'clsx';

import { Icon } from '@/components/icons';

import type { Confirmation } from '../../lib/confirmation';
import styles from './NextSteps.module.css';

/** "What happens next": a vertical timeline from booking to departure. */
export function NextSteps({ steps }: { steps: Confirmation['timeline'] }) {
  return (
    <section className={styles.card} aria-labelledby="next-steps-title">
      <h2 id="next-steps-title" className={styles.title}>
        What happens next
      </h2>
      <ol className={styles.timeline}>
        {steps.map((step, index) => (
          <li key={step.title} className={clsx(styles.step, styles[step.status])}>
            <div className={styles.rail} aria-hidden="true">
              <span className={styles.dot}>
                {step.status === 'done' && <Icon name="check" size={12} strokeWidth={3} />}
              </span>
              {index < steps.length - 1 && <span className={styles.line} />}
            </div>
            <div className={styles.content}>
              <span className={styles.when}>{step.when}</span>
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.body}>{step.body}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
