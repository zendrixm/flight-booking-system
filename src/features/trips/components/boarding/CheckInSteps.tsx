import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Alert, Checkbox, ChoiceCard, LinkButton, StatusChip } from '@/components/ui';
import { positionOfColumn } from '@/data/seatMap';
import type { BoardingPass } from '@/types/boardingPass';

import type { Declaration } from '../../lib/checkInWizard';
import { RESTRICTED_TONE } from './BoardingDialogs';
import styles from './CheckInSteps.module.css';
import { SeatPickerGrid } from './SeatPickerGrid';

function StepSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={styles.step}>
      <div className={styles.stepHeading}>
        <h2 id={id} className={styles.stepTitle}>
          {title}
        </h2>
        <span className={styles.stepSubtitle}>{subtitle}</span>
      </div>
      {children}
    </section>
  );
}

interface TravelerStepProps {
  pass: BoardingPass;
  isIncluded: boolean;
  showError: boolean;
  onToggle: () => void;
}

export function TravelerStep({ pass, isIncluded, showError, onToggle }: TravelerStepProps) {
  const { passenger } = pass;
  return (
    <StepSection
      id="check-in-travelers"
      title="Who’s checking in?"
      subtitle={`Booking ${pass.reference} · 1 traveler on this flight`}
    >
      <ChoiceCard
        type="checkbox"
        checked={isIncluded}
        onChange={onToggle}
        aria-invalid={showError || undefined}
        className={clsx(showError && styles.invalid)}
        leading={
          <span className={styles.initials} aria-hidden="true">
            {passenger.initials}
          </span>
        }
        title={passenger.fullName}
        description={`${passenger.passengerType} · E-ticket ${passenger.ticketNumber} · Seat ${pass.seat}`}
        meta={
          <StatusChip tone={isIncluded ? 'success' : 'muted'} hideDot>
            {isIncluded ? 'Ready to check in' : 'Not checking in'}
          </StatusChip>
        }
      />
      {showError && (
        <span role="alert" className={styles.error}>
          Select at least one traveler to check in.
        </span>
      )}
      <p className={styles.note}>
        Travelling with an infant or need help at the airport?{' '}
        <Link to={`${paths.help}#message`}>Message us</Link> before you check in.
      </p>
    </StepSection>
  );
}

interface DocumentsStepProps {
  pass: BoardingPass;
  isConfirmed: boolean;
  onToggle: () => void;
}

export function DocumentsStep({ pass, isConfirmed, onToggle }: DocumentsStepProps) {
  const { passenger } = pass;
  return (
    <StepSection
      id="check-in-documents"
      title="Confirm travel documents"
      subtitle={`${passenger.fullName} · ${passenger.passportLabel}`}
    >
      <div className={styles.passport}>
        <div className={styles.passportHeader}>
          <span className={styles.source}>
            <Icon name="passport" size={14} strokeWidth={1.8} />
            From your booking
          </span>
          <Link to={paths.trip(pass.reference)} className={styles.inlineLink}>
            Edit details
          </Link>
        </div>
        <dl className={styles.passportFields}>
          {passenger.passportFields.map((field) => (
            <div key={field.label} className={styles.passportField}>
              <dt className={styles.passportLabel}>{field.label}</dt>
              <dd className={styles.passportValue}>{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ul className={styles.requirements}>
        {pass.entryRequirements.map((requirement) => (
          <li key={requirement.title} className={styles.requirement}>
            <span className={requirement.isMet ? styles.metDot : styles.todoDot}>
              <Icon name={requirement.isMet ? 'check' : 'exclamation'} size={12} strokeWidth={3} />
            </span>
            <span className={styles.requirementText}>
              <span className={styles.requirementTitle}>
                {requirement.title}
                <span className="visually-hidden">{requirement.isMet ? ' — done' : ' — to do'}</span>
              </span>
              <span className={styles.requirementDetail}>{requirement.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <Checkbox
        className={styles.confirm}
        label={`These details match ${passenger.firstName}’s passport, which will be carried on this trip.`}
        checked={isConfirmed}
        onChange={onToggle}
      />
    </StepSection>
  );
}

interface DeclarationStepProps {
  pass: BoardingPass;
  declaration: Declaration | null;
  onDeclare: (declaration: Declaration) => void;
  onShowFullList: () => void;
}

const DECLARATION_OPTIONS: ReadonlyArray<{ value: Declaration; label: string }> = [
  { value: 'none', label: 'I’m not carrying any restricted items' },
  { value: 'carrying', label: 'I’m carrying one or more of these items' },
];

export function DeclarationStep({ pass, declaration, onDeclare, onShowFullList }: DeclarationStepProps) {
  return (
    <StepSection
      id="check-in-restricted"
      title="Restricted items declaration"
      subtitle={`Required by ${pass.airlineName} and airport security for every traveler`}
    >
      <div className={styles.tiles}>
        {pass.restrictedItems.map((group) => (
          <div key={group.title} className={styles.tile}>
            <StatusChip tone={RESTRICTED_TONE[group.tone]} hideDot>
              {group.title}
            </StatusChip>
            <span className={styles.tileText}>{group.summary}</span>
          </div>
        ))}
      </div>
      <button type="button" className={styles.textButton} aria-haspopup="dialog" onClick={onShowFullList}>
        See the full list
      </button>
      <fieldset className={styles.declaration}>
        <legend className="visually-hidden">Restricted items declaration</legend>
        {DECLARATION_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            name="restricted-items"
            checked={declaration === option.value}
            onChange={() => onDeclare(option.value)}
            className={clsx(option.value === 'carrying' && styles.dangerChoice)}
            title={option.label}
          />
        ))}
      </fieldset>
      {declaration === 'carrying' && (
        <Alert
          tone="danger"
          role="alert"
          title="You can’t check in online"
          action={
            <LinkButton to={`${paths.help}#chat`} variant="quiet" size="small">
              Ask about an item
            </LinkButton>
          }
        >
          Leave the items at home and change your answer, or check in at {pass.counterCheckIn.location} from{' '}
          {pass.counterCheckIn.opensAt}. Staff can help you repack or dispose of them before security.
        </Alert>
      )}
    </StepSection>
  );
}

interface SeatStepProps {
  pass: BoardingPass;
  seat: string;
  onPickSeat: (seat: string) => void;
}

export function SeatStep({ pass, seat, onPickSeat }: SeatStepProps) {
  const position = positionOfColumn(seat.slice(-1)).toLowerCase();
  return (
    <StepSection
      id="check-in-seat"
      title="Check your seat"
      subtitle={`Seat ${seat} · ${position}, included with your fare. Tap another free seat to switch — it’s free until ${pass.bagDropCloses}.`}
    >
      <SeatPickerGrid rows={pass.seatRows} freeSeats={pass.freeSeats} value={seat} onChange={onPickSeat} />
    </StepSection>
  );
}
