import clsx from 'clsx';

import { VelaMark } from '@/components/icons';
import type { LogoVariant } from '@/types/console/settings';

import styles from './LogoPreview.module.css';

/** The Vela logo as it appears in a given brand variant. Decorative: name the variant in text nearby. */
export function LogoPreview({
  variant,
  size = 'default',
}: {
  variant: LogoVariant;
  size?: 'default' | 'small';
}) {
  return (
    <span aria-hidden="true" className={clsx(styles.tile, styles[variant], size === 'small' && styles.small)}>
      <VelaMark
        size={size === 'small' ? 16 : 20}
        color={variant === 'mono' ? 'var(--color-midnight)' : undefined}
      />
      <span className={styles.wordmark}>Vela</span>
    </span>
  );
}
