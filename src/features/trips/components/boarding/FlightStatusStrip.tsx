import { StatusChip } from '@/components/ui';
import type { BoardingPass } from '@/types/boardingPass';

import styles from './FlightStatusStrip.module.css';

/** Live status and the four times and places a traveler needs at the airport. */
export function FlightStatusStrip({ pass }: { pass: BoardingPass }) {
  const facts = [
    { label: 'Boarding', value: pass.boardingTime },
    { label: 'Gate', value: pass.gate },
    { label: 'Terminal', value: pass.from.terminal },
    { label: 'Departs', value: pass.departureTime },
  ];

  return (
    <div className={styles.strip}>
      <StatusChip tone={pass.status === 'On time' ? 'success' : 'warning'}>{pass.status}</StatusChip>
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt className={styles.label}>{fact.label}</dt>
            <dd className={styles.value}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
