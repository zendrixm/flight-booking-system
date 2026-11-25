import { OFFICES } from '../content/aboutContent';
import styles from './OfficeList.module.css';

export function OfficeList() {
  return (
    <ul className={styles.grid}>
      {OFFICES.map((office) => (
        <li key={office.city} className={styles.office}>
          <span className={styles.kind}>{office.kind}</span>
          <span className={styles.city}>{office.city}</span>
          <address className={styles.address}>{office.address}</address>
          <span className={styles.team}>{office.team}</span>
        </li>
      ))}
    </ul>
  );
}
