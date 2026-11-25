import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import {
  Alert,
  Avatar,
  Button,
  Drawer,
  EmptyState,
  Spinner,
  StatusChip,
  TextAreaField,
  useToast,
} from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { formatPeso } from '@/lib/format';
import * as customerActions from '@/services/console/customersService';
import { ApiError } from '@/services/mockApi';
import type { CustomerActionResult, CustomerDetail, CustomerSummary } from '@/types/console/customer';

import {
  customerStatusChip,
  formatCreditBalance,
  formatLifetimeValue,
  tierProgressLabel,
  tierProgressPercent,
} from '../lib/customerPresentation';
import { AccountStatusDialog, PasswordResetDialog, TravelCreditDialog } from './CustomerActionDialogs';
import styles from './CustomerDrawer.module.css';
import { TierBadge } from './TierBadge';

interface CustomerDrawerProps {
  customerId: string;
  /** The list row, shown in the header while the full account loads. */
  summary?: CustomerSummary;
  onClose: () => void;
  /** Called after any change, so the list can refresh its columns. */
  onChanged: () => void;
}

/** One customer account: loyalty, contact (masked), bookings, credit, notes and account actions. */
export function CustomerDrawer({ customerId, summary, onClose, onChanged }: CustomerDrawerProps) {
  const result = useAsyncData(`customer-${customerId}`, () => customerActions.getCustomer(customerId));

  if (result.data) {
    return (
      <CustomerDrawerContent
        key={customerId}
        initialCustomer={result.data}
        onClose={onClose}
        onChanged={onChanged}
      />
    );
  }

  const isMissing = result.status === 'success' && result.data === null;
  return (
    <Drawer
      open
      onClose={onClose}
      title={summary?.fullName ?? (isMissing ? 'Customer not found' : 'Customer')}
      size="wide"
    >
      {result.status === 'error' ? (
        <Alert
          tone="danger"
          role="alert"
          title="This account didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      ) : isMissing ? (
        <EmptyState
          variant="plain"
          icon="searchX"
          title="We couldn’t find that customer"
          description="The link may be out of date. Search by name, email or member number instead."
        />
      ) : (
        <div className={styles.loading} role="status">
          <Spinner size={20} />
          Loading customer…
        </div>
      )}
    </Drawer>
  );
}

type OpenDialog = 'reset' | 'credit' | 'status' | null;

interface CustomerDrawerContentProps {
  initialCustomer: CustomerDetail;
  onClose: () => void;
  onChanged: () => void;
}

function CustomerDrawerContent({ initialCustomer, onClose, onChanged }: CustomerDrawerContentProps) {
  const toast = useToast();
  const [customer, setCustomer] = useState(initialCustomer);
  const [revealed, setRevealed] = useState<{ contact: string; auditNote: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [busyAction, setBusyAction] = useState<'reveal' | 'note' | 'dialog' | null>(null);

  const isSuspended = customer.status === 'suspended';
  const chip = customerStatusChip(customer.status);

  /** Runs an account change, keeps the drawer in sync and tells the list. */
  const run = async (
    action: 'note' | 'dialog',
    task: () => Promise<CustomerActionResult>,
    { announce = true } = {},
  ) => {
    setBusyAction(action);
    try {
      const { customer: updated, message } = await task();
      setCustomer(updated);
      setOpenDialog(null);
      onChanged();
      if (announce) toast.show({ tone: 'success', message });
      return true;
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'That didn’t go through. Try again.',
      });
      return false;
    } finally {
      setBusyAction(null);
    }
  };

  const reveal = async () => {
    setBusyAction('reveal');
    try {
      setRevealed(await customerActions.revealCustomerContact(customer.id));
    } finally {
      setBusyAction(null);
    }
  };

  const saveNote = async () => {
    const saved = await run('note', () => customerActions.addCustomerNote(customer.id, noteDraft), {
      announce: false,
    });
    if (saved) setNoteDraft('');
  };

  return (
    <Drawer
      open
      onClose={onClose}
      size="wide"
      leading={<Avatar initials={customer.initials} size={56} tone="brass" />}
      title={customer.fullName}
      description={
        <>
          Member since {customer.memberSince} · <span className={styles.nowrap}>{customer.memberNumber}</span>
        </>
      }
      headerExtra={
        <span className={styles.badges}>
          <TierBadge tier={customer.tier} />
          <StatusChip tone={chip.tone} hideDot size="compact">
            {chip.label}
          </StatusChip>
        </span>
      }
    >
      <section className={styles.section} aria-label="Overview">
        {customer.statusNote && (
          <Alert tone={isSuspended ? 'danger' : 'attention'} icon={isSuspended ? 'ban' : 'alertTriangle'}>
            {customer.statusNote}
          </Alert>
        )}
        <div className={styles.progress}>
          <span className={styles.progressText}>
            <strong>{customer.tier} tier</strong>
            <span>{tierProgressLabel(customer)}</span>
          </span>
          <span className={styles.progressTrack} aria-hidden="true">
            <span className={styles.progressFill} style={{ width: `${tierProgressPercent(customer)}%` }} />
          </span>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Lifetime value</dt>
            <dd>{formatLifetimeValue(customer.lifetimeValue)}</dd>
          </div>
          <div>
            <dt>Trips</dt>
            <dd>{customer.trips}</dd>
          </div>
          <div>
            <dt>Travel credit</dt>
            <dd>{formatCreditBalance(customer.creditBalance, '₱0')}</dd>
          </div>
        </dl>
      </section>

      <Section title="Contact">
        <span className={styles.contact}>
          <span className={styles.contactText}>{revealed?.contact ?? customer.maskedContact}</span>
          <Button
            variant="quiet"
            size="small"
            disabled={revealed !== null}
            loading={busyAction === 'reveal'}
            onClick={() => void reveal()}
          >
            {revealed ? 'Logged' : 'Reveal'}
          </Button>
        </span>
        {revealed && (
          <p role="status" className={styles.muted}>
            {revealed.auditNote}
          </p>
        )}
      </Section>

      <Section title="Bookings">
        {customer.bookings.length === 0 && <p className={styles.muted}>No bookings in the last 30 days.</p>}
        {customer.bookings.map((booking) => (
          <Link
            key={booking.reference}
            to={paths.console.booking(booking.reference)}
            className={styles.booking}
          >
            <span className={styles.stack}>
              <span className={styles.strong}>{booking.destination}</span>
              <span className={styles.small}>{booking.summary}</span>
            </span>
            <span className={styles.bookingStatus}>
              <span className={styles.reference}>{booking.reference}</span>
              <StatusChip tone={booking.status.tone} hideDot size="compact">
                {booking.status.label}
              </StatusChip>
            </span>
          </Link>
        ))}
        {customer.pastTrips.map((trip) => (
          <span key={`${trip.destination}-${trip.summary}`} className={styles.pastTrip}>
            <span>{trip.destination}</span>
            <span>{trip.summary}</span>
          </span>
        ))}
      </Section>

      <Section
        title="Travel credit"
        aside={<strong>{formatCreditBalance(customer.creditBalance, '₱0')}</strong>}
      >
        {customer.credits.length === 0 && <p className={styles.muted}>No travel credit on this account.</p>}
        {customer.credits.map((credit) => (
          <span key={`${credit.title}-${credit.detail}`} className={styles.credit}>
            <span className={styles.stack}>
              <span className={styles.strong}>{credit.title}</span>
              <span className={styles.small}>{credit.detail}</span>
            </span>
            <span className={styles.creditAmount}>+{formatPeso(credit.amount)}</span>
          </span>
        ))}
      </Section>

      <Section title="Internal notes">
        {customer.notes.map((note) => (
          <div key={`${note.author}-${note.when}-${note.text}`} className={styles.note}>
            <span className={styles.small}>
              {note.author} · {note.when}
            </span>
            <span>{note.text}</span>
          </div>
        ))}
        <TextAreaField
          label="Add a note"
          rows={2}
          placeholder="Visible to staff only"
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
        />
        <Button
          variant="primary"
          className={styles.endButton}
          disabled={!noteDraft.trim()}
          loading={busyAction === 'note'}
          onClick={() => void saveNote()}
        >
          Save note
        </Button>
      </Section>

      <Section title="Account actions">
        <Button
          variant="quiet"
          fullWidth
          aria-haspopup="dialog"
          disabled={isSuspended}
          onClick={() => setOpenDialog('reset')}
        >
          {customer.passwordResetSentAt ? 'Resend password reset link' : 'Send password reset link'}
        </Button>
        {customer.passwordResetSentAt && (
          <p role="status" className={styles.success}>
            <Icon name="checkCircle" size={14} strokeWidth={2} />
            Reset link sent at {customer.passwordResetSentAt} · expires 30 minutes later
          </p>
        )}
        <Button
          variant="quiet"
          fullWidth
          aria-haspopup="dialog"
          disabled={isSuspended}
          onClick={() => setOpenDialog('credit')}
        >
          Issue travel credit
        </Button>
        <Button
          variant={isSuspended ? 'primary' : 'destructiveQuiet'}
          fullWidth
          aria-haspopup="dialog"
          onClick={() => setOpenDialog('status')}
        >
          {isSuspended ? 'Reinstate account' : 'Suspend account'}
        </Button>
        {isSuspended && (
          <p className={styles.small}>
            Password reset and travel credit are off while the account is suspended.
          </p>
        )}
      </Section>

      {openDialog === 'reset' && (
        <PasswordResetDialog
          customer={customer}
          isBusy={busyAction === 'dialog'}
          onClose={() => setOpenDialog(null)}
          onSend={(options) =>
            void run('dialog', () => customerActions.sendPasswordReset(customer.id, options))
          }
        />
      )}
      {openDialog === 'credit' && (
        <TravelCreditDialog
          customer={customer}
          isBusy={busyAction === 'dialog'}
          onClose={() => setOpenDialog(null)}
          onIssue={(request) =>
            void run('dialog', () => customerActions.issueTravelCredit(customer.id, request))
          }
        />
      )}
      {openDialog === 'status' && (
        <AccountStatusDialog
          customer={customer}
          isBusy={busyAction === 'dialog'}
          onClose={() => setOpenDialog(null)}
          onSuspend={(reason) =>
            void run('dialog', () => customerActions.suspendCustomer(customer.id, reason))
          }
          onReinstate={() => void run('dialog', () => customerActions.reinstateCustomer(customer.id))}
        />
      )}
    </Drawer>
  );
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  const headingId = useId();
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHeader}>
        <h3 id={headingId} className={styles.caption}>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}
