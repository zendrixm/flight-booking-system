import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import { Spinner } from '../Spinner';
import { buttonClassName, type ButtonStyleOptions } from './buttonClassName';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  iconStart?: IconName;
  iconEnd?: IconName;
  /** Shows a spinner, blocks clicks and announces the busy state. Pass `loadingLabel` to change the text. */
  loading?: boolean;
  loadingLabel?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  iconStart,
  iconEnd,
  loading = false,
  loadingLabel,
  disabled,
  type = 'button',
  children,
  ...buttonProps
}: ButtonProps) {
  const iconSize = size === 'small' ? 14 : 16;

  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {loading ? <Spinner size={iconSize} /> : iconStart && <Icon name={iconStart} size={iconSize} />}
      {loading && loadingLabel ? loadingLabel : children}
      {!loading && iconEnd && <Icon name={iconEnd} size={iconSize} />}
    </button>
  );
}
