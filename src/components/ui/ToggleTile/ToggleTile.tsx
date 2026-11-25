import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import styles from './ToggleTile.module.css';

export interface ToggleTileProps extends Omit<ComponentProps<'input'>, 'type'> {
  type?: 'radio' | 'checkbox';
  label: ReactNode;
  /** A second, quieter line, e.g. the hours of a departure window. */
  detail?: ReactNode;
}

/**
 * A compact, centred choice tile built on a native radio or checkbox, laid out in grids of two or
 * three (cabin, stops, departure time). Selected tiles turn Brass, like a pressed quiet button.
 */
export function ToggleTile({ type = 'radio', label, detail, className, ...inputProps }: ToggleTileProps) {
  return (
    <label className={clsx(styles.tile, className)}>
      <input type={type} className={styles.input} {...inputProps} />
      <span className={styles.face}>
        {label}
        {detail && <span className={styles.detail}>{detail}</span>}
      </span>
    </label>
  );
}
