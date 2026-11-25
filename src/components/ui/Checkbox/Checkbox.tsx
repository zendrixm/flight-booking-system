import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  /** Right-aligned detail such as a count or a price; the row then fills its container. */
  meta?: ReactNode;
}

export function Checkbox({ label, description, meta, className, disabled, ...inputProps }: CheckboxProps) {
  return (
    <label
      className={clsx(
        styles.checkbox,
        meta !== undefined && styles.withMeta,
        disabled && styles.disabled,
        className,
      )}
    >
      <input type="checkbox" className={styles.input} disabled={disabled} {...inputProps} />
      <span className={styles.text}>
        <span>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {meta !== undefined && <span className={styles.meta}>{meta}</span>}
    </label>
  );
}
