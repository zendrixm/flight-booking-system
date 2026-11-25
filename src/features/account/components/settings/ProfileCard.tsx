import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Alert, Button, StatusChip, TextField } from '@/components/ui';
import { MONTHS_LONG, parseIsoDate } from '@/lib/date';
import { initialsOf } from '@/lib/format';
import { maskInternationalMobile } from '@/lib/phone';
import type { AccountProfileDetails, ProfileUpdate } from '@/types/accountSettings';
import { fullNameOf, type Customer } from '@/types/customer';

import { profileErrors } from '../../lib/accountSettingsForms';
import styles from './ProfileCard.module.css';
import card from './SettingsCard.module.css';

function longDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return `${date.getUTCDate()} ${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

interface ProfileCardProps {
  customer: Customer;
  details: AccountProfileDetails;
  isSaving: boolean;
  /** Resolves `true` once saved so the card can leave edit mode. */
  onSave: (update: ProfileUpdate) => Promise<boolean>;
  onCancelEmailChange: () => void;
}

export function ProfileCard({ customer, details, isSaving, onSave, onCancelEmailChange }: ProfileCardProps) {
  const [draft, setDraft] = useState<ProfileUpdate | null>(null);
  const fullName = fullNameOf(customer);

  return (
    <div className={card.card}>
      <div className={card.row}>
        <span className={styles.avatar} aria-hidden="true">
          {initialsOf(`${customer.firstName} ${customer.lastName}`)}
        </span>
        <span className={card.rowText}>
          <span className={styles.name}>{fullName}</span>
          <span className={styles.member}>
            <Icon name="stamp" size={14} strokeWidth={1.8} />
            {customer.memberTier} member since {details.memberSince}
          </span>
        </span>
        {!draft && (
          <Button
            variant="quiet"
            onClick={() =>
              setDraft({
                firstName: customer.firstName,
                middleName: customer.middleName ?? '',
                lastName: customer.lastName,
                email: details.pendingEmail ?? customer.email,
                mobile: customer.mobile,
              })
            }
          >
            Edit profile
          </Button>
        )}
      </div>

      {draft ? (
        <ProfileForm
          draft={draft}
          currentEmail={customer.email}
          isSaving={isSaving}
          onChange={(patch) => setDraft({ ...draft, ...patch })}
          onCancel={() => setDraft(null)}
          onSave={async () => {
            if (await onSave(draft)) setDraft(null);
          }}
        />
      ) : (
        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt className={styles.term}>Email</dt>
            <dd className={styles.value}>
              <span className={styles.email}>
                {customer.email}
                <StatusChip tone="success" size="compact" hideDot>
                  Verified
                </StatusChip>
              </span>
              {details.pendingEmail && (
                <span className={styles.pending}>
                  <StatusChip tone="warning" size="compact" hideDot>
                    Pending
                  </StatusChip>
                  <span className={styles.wrap}>Confirm {details.pendingEmail} from the link we sent.</span>
                  <button type="button" className={card.textButton} onClick={onCancelEmailChange}>
                    Cancel change
                  </button>
                </span>
              )}
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.term}>Mobile</dt>
            <dd className={styles.tabular}>{maskInternationalMobile(customer.mobile)}</dd>
          </div>
          <div className={styles.detailRowLocked}>
            <dt className={styles.term}>Date of birth</dt>
            <dd className={styles.locked}>
              <span className={styles.lockedValue}>
                <Icon name="lock" size={14} strokeWidth={1.8} />
                {longDate(details.dateOfBirth)}
              </span>
              <span className={styles.lockedNote}>
                Matches your passport · <Link to={paths.help}>Ask us to correct it</Link>
              </span>
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}

interface ProfileFormProps {
  draft: ProfileUpdate;
  currentEmail: string;
  isSaving: boolean;
  onChange: (patch: Partial<ProfileUpdate>) => void;
  onCancel: () => void;
  onSave: () => void;
}

function ProfileForm({ draft, currentEmail, isSaving, onChange, onCancel, onSave }: ProfileFormProps) {
  const [hasTried, setHasTried] = useState(false);
  const errors = profileErrors(draft);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const isEmailChanging = !errors.email && draft.email.trim().toLowerCase() !== currentEmail.toLowerCase();

  return (
    <form
      aria-label="Edit profile"
      noValidate
      className={card.formPanel}
      onSubmit={(event) => {
        event.preventDefault();
        if (Object.keys(errors).length > 0) setHasTried(true);
        else onSave();
      }}
    >
      <div className={styles.nameGrid}>
        <TextField
          label="First name"
          required
          autoComplete="given-name"
          value={draft.firstName}
          error={visible.firstName}
          onChange={(event) => onChange({ firstName: event.target.value })}
        />
        <TextField
          label="Middle name"
          autoComplete="additional-name"
          value={draft.middleName}
          onChange={(event) => onChange({ middleName: event.target.value })}
        />
        <TextField
          label="Last name"
          required
          autoComplete="family-name"
          value={draft.lastName}
          error={visible.lastName}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
      </div>
      <TextField
        label="Email"
        required
        type="email"
        autoComplete="email"
        value={draft.email}
        error={visible.email}
        onChange={(event) => onChange({ email: event.target.value })}
      />
      {isEmailChanging && (
        <Alert tone="attention" icon="mail">
          We’ll send a confirmation link to the new address. Your current email keeps working until you
          confirm.
        </Alert>
      )}
      <TextField
        label="Mobile number"
        required
        type="tel"
        autoComplete="tel"
        value={draft.mobile}
        error={visible.mobile}
        onChange={(event) => onChange({ mobile: event.target.value })}
      />
      <div className={card.formActions}>
        <Button variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSaving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
