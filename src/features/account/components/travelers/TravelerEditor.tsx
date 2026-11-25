import type { ChangeEvent, Ref } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, SegmentedControl, SelectField, StatusChip, TextField } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { ASSISTANCE_REQUESTS, COUNTRIES, PERSON_TITLES, SEAT_PREFERENCES } from '@/data/travelerOptions';
import type { AssistanceRequest } from '@/types/traveler';

import type {
  StatusLabel,
  TravelerProfile,
  TravelerProfileErrors,
  TravelerProfileField,
} from '../../lib/travelerProfile';
import styles from './TravelerEditor.module.css';

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

interface TravelerEditorProps {
  ref?: Ref<HTMLElement>;
  heading: string;
  status: StatusLabel;
  profile: TravelerProfile;
  errors: TravelerProfileErrors;
  /** Booking reference that locks the name and date of birth, if any. */
  nameLockedBy?: string;
  isNameLocked: boolean;
  passportNote: { text: string; tone: 'attention' | 'neutral' } | null;
  isNew: boolean;
  isDirty: boolean;
  isSaving: boolean;
  canRemove: boolean;
  /** Replaces "Remove traveler", e.g. to say why the account holder can't be removed. */
  removeLabel?: string;
  onChange: (patch: Partial<TravelerProfile>) => void;
  onRemove: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

/** The edit panel beside the traveler list: identity, passport and travel preferences. */
export function TravelerEditor({
  ref,
  heading,
  status,
  profile,
  errors,
  nameLockedBy,
  isNameLocked,
  passportNote,
  isNew,
  isDirty,
  isSaving,
  canRemove,
  removeLabel = 'Remove traveler',
  onChange,
  onRemove,
  onDiscard,
  onSave,
}: TravelerEditorProps) {
  const textProps = (field: TravelerProfileField, isLockable = false) => ({
    value: profile[field],
    error: errors[field],
    readOnly: isLockable && isNameLocked,
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange({ [field]: event.target.value }),
  });

  return (
    <section ref={ref} aria-label={heading} className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{heading}</h2>
        <StatusChip tone={status.tone} hideDot>
          {status.label}
        </StatusChip>
      </div>

      <div className={styles.body}>
        {isNameLocked && (
          <div className={styles.lockNote}>
            <Icon name="lock" size={16} strokeWidth={1.8} className={styles.lockIcon} />
            <span>
              Name and date of birth are locked while this traveler is on an upcoming booking
              {nameLockedBy ? ` (${nameLockedBy})` : ''}. <Link to={paths.help}>Ask us to correct them</Link>.
            </span>
          </div>
        )}

        <SegmentedControl
          label="Title"
          className={styles.titles}
          options={PERSON_TITLES.map((title) => ({ value: title, label: title }))}
          value={profile.title}
          disabled={isNameLocked}
          onChange={(title) => onChange({ title })}
        />

        <div className={styles.grid}>
          <TextField
            label="First and middle names"
            required
            autoComplete="off"
            {...textProps('firstNames', true)}
          />
          <TextField label="Last name" required autoComplete="off" {...textProps('lastName', true)} />
          <TextField
            label="Date of birth"
            required
            type="date"
            max={DEMO_TODAY}
            {...textProps('dateOfBirth', true)}
          />
          <SelectField
            label="Nationality"
            required
            options={toOptions(COUNTRIES)}
            value={profile.nationality}
            onChange={(event) => onChange({ nationality: event.target.value })}
          />
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupLabel}>Passport</h3>
          <div className={styles.grid}>
            <TextField
              label="Passport number"
              placeholder="e.g. P1234567A"
              autoComplete="off"
              inputClassName={styles.passportNumber}
              {...textProps('passportNumber')}
              onChange={(event) => onChange({ passportNumber: event.target.value.toUpperCase() })}
            />
            <TextField label="Expiry date" type="date" {...textProps('passportExpiry')} />
          </div>
          {passportNote && (
            <p
              role="status"
              className={passportNote.tone === 'attention' ? styles.noteAttention : styles.note}
            >
              <Icon name="alertCircle" size={16} strokeWidth={1.8} className={styles.noteIcon} />
              <span>{passportNote.text}</span>
            </p>
          )}
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupLabel}>Preferences</h3>
          <SegmentedControl
            label="Seat preference"
            appearance="soft"
            density="compact"
            fullWidth
            options={SEAT_PREFERENCES.map((seat) => ({ value: seat, label: seat }))}
            value={profile.seatPreference}
            onChange={(seatPreference) => onChange({ seatPreference })}
          />
          <div className={styles.grid}>
            <TextField
              label="Loyalty number"
              placeholder="e.g. 123 456 789"
              autoComplete="off"
              {...textProps('loyaltyNumber')}
            />
            <SelectField
              label="Special assistance"
              options={toOptions(ASSISTANCE_REQUESTS)}
              value={profile.assistance}
              onChange={(event) => onChange({ assistance: event.target.value as AssistanceRequest })}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="destructiveQuiet"
          size="small"
          disabled={!canRemove}
          aria-haspopup="dialog"
          onClick={onRemove}
        >
          {removeLabel}
        </Button>
        <span className={styles.footerActions}>
          <Button variant="secondary" disabled={!isDirty || isSaving} onClick={onDiscard}>
            Discard
          </Button>
          <Button variant="primary" disabled={!isDirty} loading={isSaving} onClick={onSave}>
            {isNew ? 'Save traveler' : 'Save changes'}
          </Button>
        </span>
      </div>
    </section>
  );
}
