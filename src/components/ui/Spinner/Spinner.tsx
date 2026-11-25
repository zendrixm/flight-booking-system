import styles from './Spinner.module.css';

interface SpinnerProps {
  /** Diameter in pixels. */
  size?: number;
  className?: string;
}

/** A decorative loading ring. Pair it with visible text or `aria-busy` on the busy region. */
export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={className ? `${styles.spinner} ${className}` : styles.spinner}
      style={{ width: size, height: size }}
    />
  );
}
