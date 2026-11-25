import { Table } from '@/components/ui';

import type { ConfirmedTraveler } from '../../lib/confirmation';
import styles from './TravelerTickets.module.css';

export function TravelerTickets({ travelers }: { travelers: readonly ConfirmedTraveler[] }) {
  return (
    <section className={styles.card} aria-labelledby="travelers-title">
      <h2 id="travelers-title" className={styles.title}>
        Travelers
      </h2>
      <Table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">E-ticket</th>
            <th scope="col">Seats</th>
            <th scope="col">Bags</th>
          </tr>
        </thead>
        <tbody>
          {travelers.map((traveler) => (
            <tr key={traveler.ticketNumber}>
              <th scope="row">{traveler.name}</th>
              <td>{traveler.ticketNumber}</td>
              <td>{traveler.seats.join(' · ')}</td>
              <td>{traveler.bags}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
