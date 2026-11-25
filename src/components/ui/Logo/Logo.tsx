import clsx from 'clsx';
import { Link } from 'react-router';

import { VelaMark } from '@/components/icons';

import styles from './Logo.module.css';

interface LogoProps {
  to: string;
  /** Accessible name of the link, e.g. "Vela home". */
  label: string;
  /** Wordmark size in pixels. */
  size?: number;
  /** Product name after the wordmark, e.g. "Console". */
  product?: string;
  className?: string;
  /** Lets a header hide the wordmark on narrow screens and keep only the mark. */
  wordmarkClassName?: string;
  productClassName?: string;
}

export function Logo({
  to,
  label,
  size = 30,
  product,
  className,
  wordmarkClassName,
  productClassName,
}: LogoProps) {
  return (
    <Link to={to} aria-label={label} className={clsx(styles.logo, className)}>
      <VelaMark size={Math.round(size * 0.72)} />
      <span className={clsx(styles.wordmark, wordmarkClassName)} style={{ fontSize: size }}>
        Vela
      </span>
      {product && <span className={clsx(styles.product, productClassName)}>{product}</span>}
    </Link>
  );
}
