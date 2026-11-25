import clsx from 'clsx';

import { Button, StatusChip, Switch, Table } from '@/components/ui';
import type { PromoCode } from '@/types/console/pricing';

import {
  isPromoLocked,
  isPromoSwitchedOn,
  promoOffer,
  promoStatusChip,
  redemptionShare,
  redemptionsLabel,
  validityLabel,
} from '../lib/promoPresentation';
import styles from './PromoCodesTable.module.css';

interface PromoCodesTableProps {
  promoCodes: readonly PromoCode[];
  /** Turning a code off asks first; turning it back on is immediate. */
  onToggle: (promo: PromoCode, isOn: boolean) => void;
  onEdit: (promo: PromoCode) => void;
}

export function PromoCodesTable({ promoCodes, onToggle, onEdit }: PromoCodesTableProps) {
  return (
    <Table minWidth={940} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Code</th>
          <th scope="col">Offer</th>
          <th scope="col">Redemptions</th>
          <th scope="col">Valid</th>
          <th scope="col">Status</th>
          <th scope="col" className={styles.end}>
            Active
          </th>
          <th scope="col" className={styles.end}>
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {promoCodes.map((promo) => {
          const isLocked = isPromoLocked(promo);
          const isOn = isPromoSwitchedOn(promo);
          const share = redemptionShare(promo);
          const chip = promoStatusChip(promo.status);
          return (
            <tr
              key={promo.code}
              className={clsx(isLocked && styles.locked, promo.isRecentlyChanged && styles.changed)}
            >
              <td>
                <span className={styles.code}>{promo.code}</span>
              </td>
              <td>
                <span className={styles.stack}>
                  <span className={styles.offer}>{promoOffer(promo)}</span>
                  <span className={styles.summary}>{promo.summary}</span>
                </span>
              </td>
              <td>
                <span className={styles.usage}>
                  <span>{redemptionsLabel(promo)}</span>
                  <span className={styles.usageTrack} aria-hidden="true">
                    <span
                      className={clsx(styles.usageFill, share === null && styles.unlimited)}
                      style={{ width: `${share ?? 100}%` }}
                    />
                  </span>
                </span>
              </td>
              <td className={styles.valid}>{validityLabel(promo)}</td>
              <td>
                <StatusChip tone={chip.tone} hideDot size="compact">
                  {chip.label}
                </StatusChip>
              </td>
              <td className={styles.end}>
                <Switch
                  label={`${isOn ? 'Pause' : 'Activate'} ${promo.code}`}
                  labelHidden
                  checked={isOn}
                  disabled={isLocked}
                  className={styles.switch}
                  onChange={(next) => onToggle(promo, next)}
                />
              </td>
              <td className={styles.end}>
                <Button
                  variant="quiet"
                  size="small"
                  iconStart="pencil"
                  disabled={isLocked}
                  aria-haspopup="dialog"
                  aria-label={`Edit ${promo.code}`}
                  onClick={() => onEdit(promo)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
