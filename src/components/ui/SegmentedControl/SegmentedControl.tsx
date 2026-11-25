import clsx from 'clsx';
import { useId } from 'react';

import styles from './SegmentedControl.module.css';

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
}

interface SegmentedControlProps<Value extends string> {
  /** Accessible name of the group, e.g. "Trip type". */
  label: string;
  options: ReadonlyArray<SegmentedOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  density?: 'comfortable' | 'compact';
  /** `outline` has a hairline border; `soft` sits on a 5% Midnight track. */
  appearance?: 'outline' | 'soft';
  /** Options share the full width equally instead of hugging their labels. */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/** A row of mutually exclusive options built on native radio inputs (arrow keys work for free). */
export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
  density = 'comfortable',
  appearance = 'outline',
  fullWidth,
  disabled,
  className,
}: SegmentedControlProps<Value>) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={clsx(
        styles.group,
        density === 'compact' && styles.compact,
        appearance === 'soft' && styles.soft,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        className,
      )}
    >
      {options.map((option) => {
        const inputId = `${name}-${option.value}`;
        return (
          <span key={option.value} className={styles.option}>
            <input
              id={inputId}
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className={styles.input}
            />
            <label htmlFor={inputId} className={styles.label}>
              {option.label}
            </label>
          </span>
        );
      })}
    </div>
  );
}
