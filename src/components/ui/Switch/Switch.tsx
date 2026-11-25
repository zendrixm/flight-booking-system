import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  /** Keep the label for screen readers only (e.g. in a table row that already names the setting). */
  labelHidden?: boolean;
  disabled?: boolean;
  /** `end` puts the switch after the text and stretches the row, as in settings lists. */
  placement?: 'start' | 'end';
  className?: string;
}

/** An on/off setting that applies immediately. Use a checkbox when the value is submitted with a form. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  labelHidden,
  disabled,
  placement = 'start',
  className,
}: SwitchProps) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className={clsx(styles.switchRow, placement === 'end' && styles.trackEnd, className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={styles.track}
      >
        <span className={styles.thumb} />
      </button>
      <span className={clsx(styles.text, labelHidden && 'visually-hidden')}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </span>
    </div>
  );
}
