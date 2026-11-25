import { Icon } from '@/components/icons';
import { SelectField, Switch, TextField } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import { BAGGAGE_ALLOWANCES, type BaggageAllowance, type FareFamily } from '@/types/console/pricing';

import { fareFamilyErrors, type FareFamilyDraft } from '../lib/fareFamilyForm';
import styles from './FareFamilyCard.module.css';

interface FareFamilyCardProps {
  family: FareFamily;
  draft: FareFamilyDraft;
  onChange: (change: Partial<FareFamilyDraft>) => void;
}

/** One fare family: the airline's filing (read only) and the rules Vela sets on top. */
export function FareFamilyCard({ family, draft, onChange }: FareFamilyCardProps) {
  const errors = fareFamilyErrors(draft);
  const lock = <Icon name="lock" size={14} className={styles.lockIcon} />;

  return (
    <section aria-label={`${family.name} fare family`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{family.name}</h3>
        <span className={styles.share}>{family.bookingShare}</span>
      </div>

      <div className={styles.pair}>
        <TextField
          label="Booking classes"
          value={family.bookingClasses}
          readOnly
          trailing={lock}
          inputClassName={styles.filed}
        />
        <TextField
          label="Base fare from"
          value={formatPeso(family.baseFareFrom)}
          readOnly
          trailing={lock}
          inputClassName={styles.filed}
        />
      </div>

      <SelectField
        label="Checked baggage"
        required
        value={draft.checkedBaggage}
        options={BAGGAGE_ALLOWANCES.map((allowance) => ({ value: allowance, label: allowance }))}
        onChange={(event) => onChange({ checkedBaggage: event.target.value as BaggageAllowance })}
      />

      <div className={styles.pair}>
        <TextField
          label="Change fee (₱)"
          required={draft.allowsChanges}
          inputMode="numeric"
          value={draft.allowsChanges ? draft.changeFee : 'Not allowed'}
          disabled={!draft.allowsChanges}
          error={errors.changeFee}
          onChange={(event) => onChange({ changeFee: event.target.value })}
        />
        <TextField
          label="Vela markup (%)"
          required
          inputMode="decimal"
          value={draft.markupPercent}
          error={errors.markupPercent}
          onChange={(event) => onChange({ markupPercent: event.target.value })}
        />
      </div>

      <div className={styles.toggles}>
        <Switch
          label="Changes allowed"
          placement="end"
          checked={draft.allowsChanges}
          onChange={(allowsChanges) => onChange({ allowsChanges })}
        />
        <Switch
          label="Refundable"
          placement="end"
          checked={draft.isRefundable}
          onChange={(isRefundable) => onChange({ isRefundable })}
        />
      </div>
    </section>
  );
}
