import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  /** `inverse` and `ghostInverse` are for Midnight surfaces. */
  variant?: 'ghost' | 'soft' | 'outline' | 'inverse' | 'ghostInverse';
  size?: 'small' | 'medium';
  shape?: 'round' | 'square';
  iconSize?: number;
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'medium',
  shape = 'round',
  iconSize,
  className,
  type = 'button',
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        styles.iconButton,
        styles[variant],
        size === 'small' && styles.small,
        shape === 'square' && styles.square,
        className,
      )}
      {...buttonProps}
    >
      <Icon name={icon} size={iconSize ?? (size === 'small' ? 14 : 18)} strokeWidth={1.8} />
    </button>
  );
}
