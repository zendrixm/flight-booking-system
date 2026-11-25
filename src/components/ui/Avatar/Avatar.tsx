import clsx from 'clsx';

import styles from './Avatar.module.css';

interface AvatarProps {
  /** One or two letters. */
  initials: string;
  size?: number;
  tone?: 'brass' | 'midnight' | 'neutral';
  className?: string;
}

/** Initials in a circle. Decorative: the person's name must also appear as text nearby. */
export function Avatar({ initials, size = 32, tone = 'brass', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(styles.avatar, styles[tone], className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}
