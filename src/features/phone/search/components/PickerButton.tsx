import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './PickerButton.module.css';

interface PickerButtonProps {
  label: string;
  children: ReactNode;
  onClick: () => void;
  /** `large` for the airports, which carry the most weight in the card. */
  size?: 'regular' | 'large';
  /** Dims a value that doesn't apply yet, e.g. "One way" in the Return box. */
  isMuted?: boolean;
  className?: string;
}

/** A tappable search field: small uppercase label over its value. Opens a sheet to change it. */
export function PickerButton({
  label,
  children,
  onClick,
  size = 'regular',
  isMuted = false,
  className,
}: PickerButtonProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className={clsx(styles.picker, size === 'large' && styles.large, isMuted && styles.muted, className)}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{children}</span>
    </button>
  );
}
