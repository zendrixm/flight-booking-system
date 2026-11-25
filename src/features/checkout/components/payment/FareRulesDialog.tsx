import { paths } from '@/app/paths';
import { Button, Dialog, LinkButton } from '@/components/ui';

import { FARE_RULES } from '../../lib/paymentForm';
import styles from './FareRulesDialog.module.css';

interface FareRulesDialogProps {
  open: boolean;
  onClose: () => void;
  fareName: string;
  /** "Meridian Air · MR 431 and MR 432 · both travelers" */
  context: string;
  hasAccepted: boolean;
  onAccept: () => void;
}

export function FareRulesDialog({
  open,
  onClose,
  fareName,
  context,
  hasAccepted,
  onAccept,
}: FareRulesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title={`${fareName} fare rules`}
      description={context}
      footer={
        <>
          <LinkButton to={paths.legal('carriage')} variant="quiet">
            Terms of carriage
          </LinkButton>
          <Button variant="primary" onClick={hasAccepted ? onClose : onAccept}>
            {hasAccepted ? 'Done' : 'Accept and close'}
          </Button>
        </>
      }
    >
      <dl className={styles.rules}>
        {FARE_RULES.map(({ topic, rule }) => (
          <div key={topic} className={styles.rule}>
            <dt className={styles.topic}>{topic}</dt>
            <dd className={styles.text}>{rule}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>
        If you booked at least 7 days before departure, you can still cancel within 24 hours of paying for a
        full refund.
      </p>
    </Dialog>
  );
}
