import clsx from 'clsx';

import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'quiet'
  | 'ghost'
  | 'destructive'
  | 'destructiveQuiet'
  | 'destructiveGhost'
  | 'inverse'
  | 'inverseQuiet';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Shared by `Button` and `LinkButton` so links that look like buttons stay in sync. */
export function buttonClassName({
  variant = 'primary',
  size = 'medium',
  fullWidth,
  className,
}: ButtonStyleOptions) {
  return clsx(
    styles.button,
    styles[variant],
    size !== 'medium' && styles[size],
    fullWidth && styles.fullWidth,
    className,
  );
}
