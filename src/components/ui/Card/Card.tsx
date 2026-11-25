import clsx from 'clsx';
import type { ElementType, HTMLAttributes } from 'react';

import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: 'outline' | 'quiet' | 'dark' | 'attention';
  /** `flush` removes padding for cards whose rows carry their own 24px insets (tables, lists). */
  padding?: 'default' | 'flush';
  /** 16px corners (console and dense cards) instead of 20px. */
  radius?: 'panel' | 'card';
}

/** A surface with the standard 24px padding and 16px between groups inside it. */
export function Card({
  as: Component = 'section',
  variant = 'outline',
  padding = 'default',
  radius = 'panel',
  className,
  ...elementProps
}: CardProps) {
  return (
    <Component
      className={clsx(
        styles.card,
        styles[variant],
        padding === 'flush' && styles.flush,
        radius === 'card' && styles.compactRadius,
        className,
      )}
      {...elementProps}
    />
  );
}
