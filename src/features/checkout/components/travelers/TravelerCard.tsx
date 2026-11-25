import { useId, useState, type ChangeEvent } from 'react';

import { Icon } from '@/components/icons';
import { Button, SelectField, StatusChip, TextField } from '@/components/ui';
import { ASSISTANCE_REQUESTS, COUNTRIES, LOYALTY_PROGRAMS, PERSON_TITLES } from '@/data/travelerOptions';
import { formatShortDate } from '@/lib/date';
import type { AssistanceRequest, PersonTitle, SavedTraveler, TravelerDetails } from '@/types/traveler';

import type { PassengerType } from '../../lib/travelerDefaults';
import type { TravelerErrors, TravelerField } from '../../lib/travelerValidation';
import styles from './TravelerCard.module.css';

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

interface TravelerCardProps {
  index: number;
  passengerType: PassengerType;
  traveler: TravelerDetails;
  errors: TravelerErrors;
  isComplete: boolean;
  airlineName: string;
  minPassportExpiry: string;
  /** A saved profile for this person whose passport is still valid, offered as a quick fix. */
  passportFix?: SavedTraveler;
  onChange: (patch: Partial<TravelerDetails>) => void;
  onBlur: (field: TravelerField) => void;
}

export function TravelerCard({
  index,
  passengerType,
  traveler,
  errors,
  isComplete,
  airlineName,
  minPassportExpiry,
  passportFix,
  onChange,
  onBlur,
}: TravelerCardProps) {
  const headingId = useId();
  const extrasId = useId();
  const [showExtras, setShowExtras] = useState(traveler.assistance !== 'None');
  const hasErrors = Object.keys(errors).length > 0;
  const heading = `Traveler ${index + 1} · ${passengerType}`;

  const textProps = (field: TravelerField) => ({
    value: traveler[field],
    error: errors[field],
    required: true,
    onBlur: () => onBlur(field),
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange({ [field]: event.target.value }),
  });

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.number} aria-hidden="true">
            {index + 1}
          </span>
          <div className={styles.headingText}>
            <h2 id={headingId} className={styles.heading}>
              {heading}
            </h2>
            <span className={styles.subheading}>
              {index === 0
                ? 'Lead traveler, receives the booking confirmation'
                : 'Travelling with the lead traveler'}
            </span>
          </div>
        </div>
        {isComplete ? (
          <StatusChip tone="success">Complete</StatusChip>
        ) : (
          <StatusChip tone={hasErrors ? 'danger' : 'muted'}>
            {hasErrors ? 'Needs attention' : 'To fill in'}
          </StatusChip>
        )}
      </div>

      <fieldset className={styles.titles}>
        <legend className="visually-hidden">Title</legend>
        {PERSON_TITLES.map((title) => (
          <label key={title} className={styles.titleOption}>
            <input
              type="radio"
              name={`traveler-${index}-title`}
              className="visually-hidden"
              checked={traveler.title === title}
              onChange={() => onChange({ title: title as PersonTitle })}
            />
            {title}
          </label>
        ))}
      </fieldset>

      <div className={styles.grid}>
        <TextField label="First and middle names" autoComplete="given-name" {...textProps('firstNames')} />
        <TextField label="Last name" autoComplete="family-name" {...textProps('lastName')} />
        <TextField label="Date of birth" type="date" {...textProps('dateOfBirth')} />
        <SelectField
          label="Nationality"
          required
          options={toOptions(COUNTRIES)}
          value={traveler.nationality}
          onChange={(event) => onChange({ nationality: event.target.value })}
        />
      </div>

      <div className={styles.passport}>
        <h3 className={styles.sectionLabel}>Passport</h3>
        <div className={styles.passportGrid}>
          <TextField
            label="Passport number"
            autoComplete="off"
            inputClassName={styles.passportNumber}
            {...textProps('passportNumber')}
            onChange={(event) => onChange({ passportNumber: event.target.value.toUpperCase() })}
          />
          <TextField label="Expiry date" type="date" {...textProps('passportExpiry')} />
          <SelectField
            label="Issuing country"
            required
            options={toOptions(COUNTRIES)}
            value={traveler.passportCountry}
            onChange={(event) => onChange({ passportCountry: event.target.value })}
          />
        </div>
        {errors.passportExpiry && traveler.passportExpiry && traveler.passportExpiry < minPassportExpiry && (
          <div className={styles.expiryNotice}>
            <Icon name="alertCircle" size={18} strokeWidth={1.8} className={styles.noticeIcon} />
            <div className={styles.noticeBody}>
              <p>
                <strong>This passport expires too soon.</strong> {airlineName} requires passports to be valid
                for 6 months after your return flight — until {formatShortDate(minPassportExpiry)} or later.
              </p>
              {passportFix && (
                <Button
                  variant="quiet"
                  size="small"
                  onClick={() =>
                    onChange({
                      passportNumber: passportFix.passportNumber,
                      passportExpiry: passportFix.passportExpiry,
                      passportCountry: passportFix.passportCountry,
                    })
                  }
                >
                  Use {passportFix.firstNames.split(' ')[0]}’s saved passport (
                  {passportFix.passportNumber.slice(0, 3)}•••, valid to{' '}
                  {passportFix.passportExpiry.slice(0, 4)})
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.extras}>
        <button
          type="button"
          className={styles.extrasToggle}
          aria-expanded={showExtras}
          aria-controls={extrasId}
          onClick={() => setShowExtras((open) => !open)}
        >
          <Icon name={showExtras ? 'minus' : 'plus'} size={16} strokeWidth={1.8} />
          Add frequent flyer number or assistance request
        </button>
        {showExtras && (
          <div id={extrasId} className={styles.extrasGrid}>
            <SelectField
              label="Loyalty program"
              options={toOptions(LOYALTY_PROGRAMS)}
              value={traveler.loyaltyProgram}
              onChange={(event) => onChange({ loyaltyProgram: event.target.value })}
            />
            <TextField
              label="Member number"
              placeholder="e.g. 123 456 789"
              value={traveler.loyaltyNumber}
              onChange={(event) => onChange({ loyaltyNumber: event.target.value })}
            />
            <SelectField
              className={styles.fullRow}
              label="Assistance at the airport"
              options={toOptions(ASSISTANCE_REQUESTS)}
              value={traveler.assistance}
              onChange={(event) => onChange({ assistance: event.target.value as AssistanceRequest })}
              successText={
                traveler.assistance !== 'None'
                  ? `We’ll pass this to ${airlineName}. They’ll confirm by email 48 hours before departure.`
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
