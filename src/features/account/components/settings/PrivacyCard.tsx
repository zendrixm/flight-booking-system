import { Button, StatusChip } from '@/components/ui';
import { formatPeso } from '@/lib/format';

import styles from './PrivacyCard.module.css';
import card from './SettingsCard.module.css';

interface PrivacyCardProps {
  email: string;
  travelCredit: number;
  isExportPending: boolean;
  isSaving: boolean;
  onRequestExport: () => void;
  onDeleteAccount: () => void;
}

export function PrivacyCard({
  email,
  travelCredit,
  isExportPending,
  isSaving,
  onRequestExport,
  onDeleteAccount,
}: PrivacyCardProps) {
  return (
    <>
      <div className={card.card}>
        <div className={card.row}>
          <span className={card.rowText}>
            <span className={card.rowTitle}>
              Download your data
              {isExportPending && (
                <StatusChip tone="warning" size="compact" hideDot>
                  Preparing
                </StatusChip>
              )}
            </span>
            <span className={card.rowDetail}>
              {isExportPending
                ? `We’ll email a download link to ${email} within 48 hours.`
                : 'Bookings, saved travelers, searches and preferences as a .zip file.'}
            </span>
          </span>
          <Button
            variant="secondary"
            disabled={isExportPending}
            loading={isSaving && !isExportPending}
            onClick={onRequestExport}
          >
            {isExportPending ? 'Requested' : 'Request a copy'}
          </Button>
        </div>
      </div>
      <div className={styles.danger}>
        <span className={card.rowText}>
          <span className={styles.dangerTitle}>Delete account</span>
          <span className={card.rowDetail}>
            Permanently removes your profile, saved travelers, cards and {formatPeso(travelCredit)} travel
            credit.
          </span>
        </span>
        <Button variant="destructiveQuiet" aria-haspopup="dialog" onClick={onDeleteAccount}>
          Delete account
        </Button>
      </div>
    </>
  );
}
