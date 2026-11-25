import clsx from 'clsx';
import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, StatusChip, Table, TextAreaField } from '@/components/ui';
import { formatCompactDay } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type { BookingDetail } from '@/types/console/bookingDetail';

import { ConsolePanel } from '../../../shared/components/ConsolePanel';
import styles from './DetailCards.module.css';

const signedPeso = (amount: number) => (amount < 0 ? `−${formatPeso(Math.abs(amount))}` : formatPeso(amount));

export function SegmentsCard({ detail }: { detail: BookingDetail }) {
  return (
    <ConsolePanel title="Segments" layout="flush">
      <ul className={styles.rows}>
        {detail.segments.map((segment) => (
          <li key={`${segment.flightNumber}-${segment.date}`} className={styles.segment}>
            <span className={styles.segmentFlight}>
              <span className={styles.strong}>{segment.flightNumber}</span>
              <span className={styles.muted}>{formatCompactDay(segment.date)}</span>
            </span>
            <span className={styles.segmentTimes}>
              <strong>{segment.departureTime}</strong>
              <span className={styles.airport}>{segment.from}</span>
              <span className={styles.segmentLine} aria-hidden="true" />
              <strong>{segment.arrivalTime}</strong>
              <span className={styles.airport}>{segment.to}</span>
            </span>
            <span className={styles.segmentDetail}>{segment.detail}</span>
            <StatusChip tone={segment.status.tone} hideDot size="compact">
              {segment.status.label}
            </StatusChip>
          </li>
        ))}
      </ul>
    </ConsolePanel>
  );
}

export function TravelersCard({ detail }: { detail: BookingDetail }) {
  return (
    <ConsolePanel title="Travelers" layout="flush">
      <Table minWidth={640} className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">E-ticket</th>
            <th scope="col">Seats</th>
            <th scope="col">Bags</th>
            <th scope="col">Documents</th>
          </tr>
        </thead>
        <tbody>
          {detail.travelers.map((traveler) => (
            <tr key={traveler.recordName}>
              <th scope="row">
                <span className={styles.stack}>
                  <span className={styles.strong}>{traveler.recordName}</span>
                  <span className={styles.small}>{traveler.summary}</span>
                </span>
              </th>
              <td className={styles.nowrap}>{traveler.ticketNumber ?? 'Not issued'}</td>
              <td>{traveler.seats}</td>
              <td>{traveler.bags}</td>
              <td>
                <span
                  className={clsx(
                    styles.document,
                    traveler.document.isValid ? styles.documentValid : styles.documentCheck,
                  )}
                >
                  <span className={styles.documentDot} aria-hidden="true" />
                  {traveler.document.label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ConsolePanel>
  );
}

interface ContactCardProps {
  detail: BookingDetail;
  revealedPhone: string | null;
  isRevealing: boolean;
  onReveal: () => void;
}

export function ContactCard({ detail, revealedPhone, isRevealing, onReveal }: ContactCardProps) {
  const { account, booking } = detail;
  return (
    <ConsolePanel
      title="Customer contact"
      aside={
        <span className={styles.readOnly}>
          <Icon name="lock" size={14} strokeWidth={1.8} />
          Read only · edited by the customer
        </span>
      }
    >
      <div className={styles.contactGrid}>
        <div className={styles.contactField}>
          <span className={styles.contactLabel}>Email</span>
          <span className={styles.contactValue}>{booking.email}</span>
        </div>
        <div className={styles.contactField}>
          <span className={styles.contactLabel}>Mobile</span>
          <span className={clsx(styles.contactValue, styles.contactPhone)}>
            {revealedPhone ?? detail.maskedPhone}
            <Button
              variant="quiet"
              size="small"
              disabled={Boolean(revealedPhone)}
              loading={isRevealing}
              onClick={onReveal}
            >
              {revealedPhone ? 'Revealed' : 'Reveal'}
            </Button>
          </span>
        </div>
        <div className={styles.contactField}>
          <span className={styles.contactLabel}>Account</span>
          <Link
            to={account.customerId ? paths.console.customer(account.customerId) : paths.console.customers}
            className={styles.accountLink}
          >
            {account.label}
            <Icon name="arrowUpRight" size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
      {revealedPhone && (
        <span role="status" className={styles.auditNote}>
          Access to personal data was logged to the audit trail · Lea Navarro, 00:58
        </span>
      )}
    </ConsolePanel>
  );
}

export function PaymentSummaryCard({ detail }: { detail: BookingDetail }) {
  return (
    <ConsolePanel title="Payment">
      <dl className={styles.money}>
        {detail.moneyLines.map((line) => (
          <div key={line.label} className={clsx(styles.moneyLine, line.amount < 0 && styles.credit)}>
            <dt>{line.label}</dt>
            <dd>{signedPeso(line.amount)}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.moneyTotal}>
        <span>{detail.moneyTotalLabel}</span>
        <span>{formatPeso(detail.booking.total)}</span>
      </div>
      <span className={styles.small}>{detail.moneyNote}</span>
    </ConsolePanel>
  );
}

interface NotesCardProps {
  detail: BookingDetail;
  isSaving: boolean;
  onSave: (text: string) => Promise<void>;
}

export function NotesCard({ detail, isSaving, onSave }: NotesCardProps) {
  const [draft, setDraft] = useState('');
  return (
    <ConsolePanel title="Internal notes">
      {detail.notes.length ? (
        <ul className={styles.notes}>
          {detail.notes.map((note, index) => (
            <li key={`${note.when}-${index}`} className={styles.note}>
              <span className={styles.small}>
                {note.author} · {note.when}
              </span>
              <span>{note.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className={styles.small}>No notes yet.</span>
      )}
      <TextAreaField
        label="Add a note"
        rows={3}
        placeholder="Visible to staff only"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button
        variant="secondary"
        className={styles.saveNote}
        disabled={!draft.trim()}
        loading={isSaving}
        onClick={async () => {
          await onSave(draft);
          setDraft('');
        }}
      >
        Save note
      </Button>
    </ConsolePanel>
  );
}

export function LedgerCard({ detail }: { detail: BookingDetail }) {
  return (
    <ConsolePanel
      title="Payment ledger"
      layout="flush"
      aside={`${detail.ledger.length} ${detail.ledger.length === 1 ? 'entry' : 'entries'} · amounts in PHP`}
      className={styles.ledger}
    >
      <Table minWidth={680} className={styles.table}>
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Event</th>
            <th scope="col">Method</th>
            <th scope="col" className={styles.number}>
              Amount
            </th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {detail.ledger.map((entry, index) => (
            <tr key={`${entry.when}-${entry.event}-${index}`}>
              <td className={styles.nowrap}>{entry.when}</td>
              <td>
                <span className={styles.stack}>
                  <span className={styles.strong}>{entry.event}</span>
                  <span className={styles.small}>{entry.reference}</span>
                </span>
              </td>
              <td>{entry.method}</td>
              <td className={clsx(styles.number, styles.strong)}>{signedPeso(entry.amount)}</td>
              <td>
                <StatusChip tone={entry.result.tone} hideDot size="compact">
                  {entry.result.label}
                </StatusChip>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ConsolePanel>
  );
}

export function RiskCard({ detail }: { detail: BookingDetail }) {
  return (
    <ConsolePanel title="Card and risk" className={styles.risk}>
      <dl className={styles.money}>
        {detail.risk.map((row) => (
          <div key={row.label} className={styles.moneyLine}>
            <dt>{row.label}</dt>
            <dd className={clsx(row.isWarning && styles.warningValue)}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <span className={styles.small}>
        Full card numbers are never shown in the console. Disputes are handled in Settings › Payments.
      </span>
    </ConsolePanel>
  );
}

export function TicketsCard({ detail }: { detail: BookingDetail }) {
  return (
    <ConsolePanel title="E-tickets and coupons" layout="flush" aside={detail.ticketsSummary}>
      {detail.coupons.length ? (
        <Table minWidth={760} className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Traveler</th>
              <th scope="col">E-ticket</th>
              <th scope="col">Coupon</th>
              <th scope="col">Flight</th>
              <th scope="col">Fare basis</th>
              <th scope="col">Coupon status</th>
            </tr>
          </thead>
          <tbody>
            {detail.coupons.map((coupon) => (
              <tr key={`${coupon.ticketNumber}-${coupon.coupon}`}>
                <th scope="row">{coupon.traveler}</th>
                <td>
                  <span className={styles.stack}>
                    <span className={styles.nowrap}>{coupon.ticketNumber}</span>
                    <span className={styles.small}>{coupon.issuedLabel}</span>
                  </span>
                </td>
                <td>{coupon.coupon}</td>
                <td>{coupon.flight}</td>
                <td>{coupon.fareBasis}</td>
                <td>
                  <StatusChip tone={coupon.status.tone} hideDot size="compact">
                    {coupon.status.label}
                  </StatusChip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className={styles.noTickets}>
          <span className={styles.strong}>{detail.noTickets.title}</span>
          <span className={styles.muted}>{detail.noTickets.body}</span>
        </div>
      )}
    </ConsolePanel>
  );
}

export function ActivityTimeline({ detail }: { detail: BookingDetail }) {
  return (
    <section aria-label="Activity" className={styles.activityCard}>
      <ol className={styles.timeline}>
        {detail.activity.map((item, index) => (
          <li key={`${item.when}-${item.title}-${index}`} className={styles.event}>
            <span className={styles.eventRail} aria-hidden="true">
              <span className={clsx(styles.eventDot, styles[item.tone])} />
              <span className={styles.eventLine} />
            </span>
            <span className={styles.eventBody}>
              <span className={styles.stack}>
                <span className={styles.strong}>{item.title}</span>
                <span className={styles.muted}>{item.body}</span>
              </span>
              <span className={styles.eventWhen}>{item.when}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
