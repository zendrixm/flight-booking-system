import { Icon, type IconName } from '@/components/icons';
import { Alert, Button, Dialog, LinkButton, StatusChip } from '@/components/ui';

import styles from './EntryRequirementsDialog.module.css';

const ENTRY_ITEMS: ReadonlyArray<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'passport',
    title: 'Passport valid for your whole stay',
    body: 'Each traveler needs a passport that stays valid for the entire time they are in Japan. Check the expiry date now — renewals can take weeks.',
  },
  {
    icon: 'stamp',
    title: 'Visa',
    body: 'Most Philippine passport holders need a visa for short visits to Japan. Check with the Embassy of Japan in the Philippines or an accredited travel agency, and leave plenty of time for processing.',
  },
  {
    icon: 'qrCode',
    title: 'Visit Japan Web',
    body: 'You can use Visit Japan Web to register your immigration and customs details before arrival, so you have them ready at the airport.',
  },
];

interface EntryRequirementsDialogProps {
  open: boolean;
  onClose: () => void;
  /** "Manila → Tokyo Haneda · arriving Thu, 12 Nov" */
  tripLine: string;
  travelers: ReadonlyArray<{ name: string; passportLabel: string }>;
  manageBookingPath: string;
}

export function EntryRequirementsDialog({
  open,
  onClose,
  tripLine,
  travelers,
  manageBookingPath,
}: EntryRequirementsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title="Travelling to Japan from the Philippines"
      description={tripLine}
      footer={
        <>
          <LinkButton to={manageBookingPath} variant="quiet">
            Check passport details
          </LinkButton>
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </>
      }
    >
      <ul className={styles.items}>
        {ENTRY_ITEMS.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.icon}>
              <Icon name={item.icon} size={20} />
            </span>
            <span className={styles.text}>
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemBody}>{item.body}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.travelers}>
        <h3 className={styles.travelersTitle}>Travelers on this booking</h3>
        {travelers.map((traveler) => (
          <div key={traveler.name} className={styles.traveler}>
            <span className={styles.travelerText}>
              <span className={styles.travelerName}>{traveler.name}</span>
              <span className={styles.passport}>{traveler.passportLabel}</span>
            </span>
            <span className={styles.chips}>
              <StatusChip tone="success" size="compact">
                Passport covers trip
              </StatusChip>
              <StatusChip tone="warning" size="compact">
                Check visa
              </StatusChip>
            </span>
          </div>
        ))}
      </div>
      <Alert tone="info">
        Entry rules can change and depend on each traveler’s nationality and circumstances. Always confirm the
        official requirements before you travel — Vela can’t issue visas or guarantee entry.
      </Alert>
    </Dialog>
  );
}
