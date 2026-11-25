import { Spinner } from '@/components/ui';

import styles from './PageLoader.module.css';

interface PageLoaderProps {
  label?: string;
}

/** Centred spinner shown while a page's code or data loads. */
export function PageLoader({ label = 'Loading…' }: PageLoaderProps) {
  return (
    <div className={styles.loader} role="status">
      <Spinner size={24} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
