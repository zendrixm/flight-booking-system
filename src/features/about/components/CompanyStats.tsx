import { COMPANY_STATS } from '../content/aboutContent';
import styles from './CompanyStats.module.css';

export function CompanyStats() {
  return (
    <section aria-label="Vela in numbers">
      <dl className={styles.stats}>
        {COMPANY_STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            {/* The number reads first visually; the term stays first for screen readers. */}
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
            <dd className={styles.detail}>{stat.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
