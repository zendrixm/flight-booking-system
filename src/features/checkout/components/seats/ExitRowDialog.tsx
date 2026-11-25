import { Icon } from '@/components/icons';
import { Alert, Button, Dialog } from '@/components/ui';
import { EXIT_ROW_RULES, ZONE_PRICES } from '@/data/seatMap';
import { formatPeso } from '@/lib/format';

import styles from './ExitRowDialog.module.css';

interface ExitRowDialogProps {
  seatCode: string | null;
  flightLabel: string;
  travelerName: string;
  airlineName: string;
  onAccept: () => void;
  onClose: () => void;
}

/** Exit-row seats come with conditions the traveler has to accept first. */
export function ExitRowDialog({
  seatCode,
  flightLabel,
  travelerName,
  airlineName,
  onAccept,
  onClose,
}: ExitRowDialogProps) {
  return (
    <Dialog
      open={seatCode !== null}
      onClose={onClose}
      size="medium"
      title={`Exit row seat ${seatCode ?? ''}`}
      description={`Extra legroom · ${formatPeso(ZONE_PRICES.legroom)} · ${flightLabel} · ${travelerName}`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Choose another seat
          </Button>
          <Button variant="primary" onClick={onAccept}>
            I meet these conditions
          </Button>
        </>
      }
    >
      <p className={styles.intro}>
        Exit row seats have extra legroom and a little extra responsibility. To sit here, each traveler must:
      </p>
      <ul className={styles.rules}>
        {EXIT_ROW_RULES.map((rule) => (
          <li key={rule} className={styles.rule}>
            <Icon name="check" size={16} strokeWidth={2} className={styles.check} />
            {rule}
          </li>
        ))}
      </ul>
      <Alert tone="attention" icon="info">
        If these don’t apply on the day, the crew will move you to another seat and {airlineName} refunds the
        seat fee.
      </Alert>
    </Dialog>
  );
}
