import clsx from 'clsx';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Logo } from '@/components/ui';
import type { CheckoutStepId } from '@/types/checkout';

import { CHECKOUT_STEPS, stepIndex } from '../lib/checkoutSteps';
import styles from './CheckoutHeader.module.css';

interface CheckoutHeaderProps {
  currentStep: CheckoutStepId;
  furthestStep: CheckoutStepId;
}

/** Midnight bar with the five checkout steps: done steps link back, later steps are locked. */
export function CheckoutHeader({ currentStep, furthestStep }: CheckoutHeaderProps) {
  const currentIndex = stepIndex(currentStep);
  const reachableIndex = Math.max(stepIndex(furthestStep), currentIndex);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo
          to={paths.home}
          label="Vela home"
          size={30}
          className={styles.logo}
          wordmarkClassName={styles.word}
        />
        <nav aria-label="Checkout progress">
          <ol className={styles.steps}>
            {CHECKOUT_STEPS.map((step, index) => {
              const isCurrent = index === currentIndex;
              const isDone = index < currentIndex;
              const isReachable = index <= reachableIndex;
              const marker = isDone ? <Icon name="check" size={14} strokeWidth={2.4} /> : index + 1;
              const content = (
                <>
                  <span className={styles.dot}>{marker}</span>
                  <span className={styles.label}>
                    {step.label}
                    {isDone && <span className="visually-hidden"> (done)</span>}
                  </span>
                </>
              );
              return (
                <li
                  key={step.id}
                  className={clsx(styles.step, isDone && styles.done, isCurrent && styles.current)}
                >
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className={clsx(styles.line, index <= currentIndex && styles.lineDone)}
                    />
                  )}
                  {isReachable && !isCurrent ? (
                    <Link to={step.path} className={styles.link}>
                      {content}
                    </Link>
                  ) : (
                    <span
                      className={clsx(styles.link, !isReachable && styles.locked)}
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-disabled={!isReachable || undefined}
                      title={
                        isReachable
                          ? undefined
                          : `Finish ${CHECKOUT_STEPS[currentIndex].label.toLowerCase()} first`
                      }
                    >
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <span className={styles.secure}>
          <Icon name="lock" size={16} />
          Secure checkout
        </span>
      </div>
    </header>
  );
}
