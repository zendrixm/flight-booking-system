import styles from './OrDivider.module.css';

/** A labelled rule between two ways of doing the same thing, e.g. SSO or email. */
export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className={styles.divider} role="separator" aria-label={label}>
      <span className={styles.line} />
      <span aria-hidden="true">{label}</span>
      <span className={styles.line} />
    </div>
  );
}
