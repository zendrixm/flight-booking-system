import { Link, type LinkProps } from 'react-router';

import { Icon, type IconName } from '@/components/icons';

import { buttonClassName, type ButtonStyleOptions } from './buttonClassName';

export interface LinkButtonProps extends LinkProps, ButtonStyleOptions {
  iconStart?: IconName;
  iconEnd?: IconName;
}

/** A router link styled as a button. Use it for navigation; use `Button` for actions. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  iconStart,
  iconEnd,
  children,
  ...linkProps
}: LinkButtonProps) {
  const iconSize = size === 'small' ? 14 : 16;

  return (
    <Link className={buttonClassName({ variant, size, fullWidth, className })} {...linkProps}>
      {iconStart && <Icon name={iconStart} size={iconSize} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={iconSize} />}
    </Link>
  );
}
