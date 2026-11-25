import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Table } from '@/components/ui';
import type { ExtrasSelection, SeatAssignments } from '@/types/checkout';
import type { TravelerDetails } from '@/types/traveler';

import { bagOptionById } from '../../lib/extrasCatalog';
import styles from './TravelerReview.module.css';

interface TravelerReviewProps {
  travelers: readonly TravelerDetails[];
  seats: SeatAssignments;
  extras: ExtrasSelection;
}

function maskPassport(number: string) {
  return `••••${number.slice(-4)}`;
}

/** Who is flying, their seats on each flight, bags and (masked) passport. */
export function TravelerReview({ travelers, seats, extras }: TravelerReviewProps) {
  return (
    <section className={styles.review} aria-labelledby="review-title">
      <div className={styles.header}>
        <h2 id="review-title" className={styles.title}>
          Travelers and add-ons
        </h2>
        <Link to={paths.checkout.travelers} className={styles.edit}>
          Edit <span className="visually-hidden">travelers</span>
        </Link>
      </div>
      <Table>
        <thead>
          <tr>
            <th scope="col">Traveler</th>
            <th scope="col">Seats</th>
            <th scope="col">Checked bags</th>
            <th scope="col">Passport</th>
          </tr>
        </thead>
        <tbody>
          {travelers.map((traveler, index) => {
            const seatCodes = [seats.outbound[index], seats.inbound[index]].map(
              (code) => code ?? 'At check-in',
            );
            return (
              <tr key={`${traveler.lastName}-${index}`}>
                <th scope="row">
                  {traveler.title} {traveler.firstNames} {traveler.lastName}
                </th>
                <td>{seatCodes.join(' · ')}</td>
                <td>{bagOptionById(extras.bags[index] ?? 'included').allowance}</td>
                <td className={styles.muted}>
                  {maskPassport(traveler.passportNumber)} · exp. {traveler.passportExpiry.slice(0, 4)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </section>
  );
}
