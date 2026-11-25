import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Checkbox, SelectField, TextField } from '@/components/ui';
import { PHONE_COUNTRY_CODES } from '@/data/travelerOptions';
import type { ContactDetails } from '@/types/traveler';

import styles from './ContactDetailsCard.module.css';

interface ContactDetailsCardProps {
  contact: ContactDetails;
  mobileError?: string;
  onChange: (patch: Partial<ContactDetails>) => void;
  onMobileBlur: () => void;
}

export function ContactDetailsCard({
  contact,
  mobileError,
  onChange,
  onMobileBlur,
}: ContactDetailsCardProps) {
  return (
    <section className={styles.card} aria-labelledby="contact-title">
      <div className={styles.header}>
        <h2 id="contact-title" className={styles.title}>
          Contact details
        </h2>
        <p className={styles.description}>We’ll send your e-tickets and any schedule changes here.</p>
      </div>
      <div className={styles.grid}>
        <TextField
          label="Email"
          hint="Read only"
          readOnly
          value={contact.email}
          trailing={<Icon name="lock" size={16} className={styles.lock} />}
          helpText={
            <>
              Managed in <Link to={paths.account.settings}>account settings</Link>
            </>
          }
        />
        <div className={styles.mobile}>
          <div className={styles.mobileRow}>
            <SelectField
              className={styles.countryCode}
              label="Country code"
              labelHidden
              options={PHONE_COUNTRY_CODES.map((code) => ({ value: code, label: code }))}
              value={contact.countryCode}
              onChange={(event) => onChange({ countryCode: event.target.value })}
            />
            <TextField
              className={styles.number}
              label="Mobile number"
              required
              inputMode="tel"
              autoComplete="tel-national"
              value={contact.mobileNumber}
              error={mobileError}
              onBlur={onMobileBlur}
              onChange={(event) => onChange({ mobileNumber: event.target.value })}
            />
          </div>
          <Checkbox
            label="Text me gate changes and delays"
            checked={contact.wantsSmsUpdates}
            onChange={(event) => onChange({ wantsSmsUpdates: event.target.checked })}
          />
        </div>
      </div>
    </section>
  );
}
