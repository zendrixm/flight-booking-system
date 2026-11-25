import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, Dialog, TextField } from '@/components/ui';
import { useNow } from '@/hooks';
import { ApiError } from '@/services/mockApi';
import { confirmWalletLink, requestWalletLink } from '@/services/paymentMethodsService';
import type { PaymentProfile } from '@/types/payment';

import { isWalletNumberComplete, partlyMaskMobileNumber } from '../../lib/paymentMethodForms';
import styles from './LinkDialogs.module.css';

type WalletStep = 'number' | 'approve';

interface LinkWalletDialogProps {
  defaultNumber: string;
  onClose: () => void;
  onLinked: (profile: PaymentProfile) => void;
}

function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Two steps: send a link request to the wallet's mobile number, then approve it in the wallet app. */
export function LinkWalletDialog({ defaultNumber, onClose, onLinked }: LinkWalletDialogProps) {
  const [step, setStep] = useState<WalletStep>('number');
  const [mobileNumber, setMobileNumber] = useState(defaultNumber);
  const [hasTried, setHasTried] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [requestError, setRequestError] = useState<string>();
  const [expiresAt, setExpiresAt] = useState(0);
  const now = useNow(1000, step === 'approve');
  const secondsLeft = Math.ceil((expiresAt - now) / 1000);
  const numberError =
    hasTried && !isWalletNumberComplete(mobileNumber)
      ? 'Philippine mobile numbers have 10 digits after +63, like 917 482 4567.'
      : requestError;

  const sendRequest = async () => {
    if (!isWalletNumberComplete(mobileNumber)) {
      setHasTried(true);
      return;
    }
    setIsBusy(true);
    setRequestError(undefined);
    try {
      const { expiresInSeconds } = await requestWalletLink(mobileNumber);
      setExpiresAt(Date.now() + expiresInSeconds * 1000);
      setStep('approve');
    } catch (error) {
      setRequestError(error instanceof ApiError ? error.message : 'We couldn’t send the request. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const finish = async () => {
    setIsBusy(true);
    try {
      onLinked(await confirmWalletLink(mobileNumber));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      eyebrow={`Link e-wallet · step ${step === 'number' ? 1 : 2} of 2`}
      title={step === 'number' ? 'Link your e-wallet' : 'Approve in your e-wallet app'}
      description={
        step === 'number'
          ? 'We’ll send a link request to the e-wallet registered to this number.'
          : 'Vela is linked as soon as you approve the request.'
      }
      footer={
        step === 'number' ? (
          <>
            <Button variant="quiet" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" loading={isBusy} onClick={sendRequest}>
              Send link request
            </Button>
          </>
        ) : (
          <div className={styles.splitFooter}>
            <button type="button" className={styles.textButton} onClick={() => setStep('number')}>
              Use a different number
            </button>
            <Button variant="primary" loading={isBusy} disabled={secondsLeft <= 0} onClick={finish}>
              I’ve approved it
            </Button>
          </div>
        )
      }
    >
      {step === 'number' ? (
        <>
          <TextField
            label="Mobile number registered to the e-wallet"
            required
            prefix="+63"
            inputMode="tel"
            autoComplete="tel-national"
            inputClassName={styles.tabular}
            value={mobileNumber}
            error={numberError}
            onChange={(event) => setMobileNumber(event.target.value)}
          />
          <ul className={styles.facts}>
            <li>
              <Icon name="shield" size={16} strokeWidth={1.8} className={styles.factIcon} />
              You approve every payment in your e-wallet app — we never charge it on our own.
            </li>
            <li>
              <Icon name="refresh" size={16} strokeWidth={1.8} className={styles.factIcon} />
              Refunds for e-wallet bookings arrive in 3–5 business days.
            </li>
          </ul>
        </>
      ) : (
        <>
          <div role="status" className={styles.waiting}>
            <span className={styles.waitingIcon} aria-hidden="true">
              <Icon name="smartphone" size={22} strokeWidth={1.6} />
            </span>
            <span className={styles.waitingText}>
              <span className={styles.waitingTitle}>
                <span className={styles.pulse} aria-hidden="true" />
                {secondsLeft > 0 ? 'Waiting for your approval' : 'The request expired'}
              </span>
              <span className={styles.waitingDetail}>
                Request sent to {partlyMaskMobileNumber(mobileNumber)}
                {secondsLeft > 0 ? ` · expires in ${formatCountdown(secondsLeft)}` : ' · send a new one'}
              </span>
            </span>
          </div>
          <ol className={styles.steps}>
            <li>Open your e-wallet app on your phone.</li>
            <li>
              Tap the notification <strong>Link Vela Travel</strong>.
            </li>
            <li>Approve with your MPIN, then come back here.</li>
          </ol>
        </>
      )}
    </Dialog>
  );
}
