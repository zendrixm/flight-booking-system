import clsx from 'clsx';

import { IconButton } from '../IconButton';
import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** "Remove one adult" */
  decrementLabel: string;
  /** "Add one adult" */
  incrementLabel: string;
  className?: string;
}

/** − 2 + : a small count with buttons, announced politely when it changes. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  decrementLabel,
  incrementLabel,
  className,
}: StepperProps) {
  return (
    <div className={clsx(styles.stepper, className)}>
      <IconButton
        icon="minus"
        label={decrementLabel}
        variant="outline"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      />
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <IconButton
        icon="plus"
        label={incrementLabel}
        variant="outline"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      />
    </div>
  );
}
