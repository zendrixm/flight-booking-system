import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, CODE_LENGTH, CodeInput } from '@/components/ui';

import { formatCountdown } from '../../hooks/useResendTimer';
import { AuthHeading } from '../AuthHeading';
import styles from './SignUp.module.css';

interface VerifyEmailStepProps {
  email: string;
  isWrong: boolean;
  isSubmitting: boolean;
  wasResent: boolean;
  secondsUntilResend: number;
  onVerify: (code: string) => void;
  onCodeEdited: () => void;
  onResend: () => void;
  onWrongEmail: () => void;
}

export function VerifyEmailStep({
  email,
  isWrong,
  isSubmitting,
  wasResent,
  secondsUntilResend,
  onVerify,
  onCodeEdited,
  onResend,
  onWrongEmail,
}: VerifyEmailStepProps) {
  const [code, setCode] = useState('');
  const isComplete = code.length === CODE_LENGTH;

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isComplete && !isWrong) onVerify(code);
      }}
    >
      <AuthHeading
        badge={{ icon: 'mail', tone: 'attention' }}
        title="Check your inbox"
        subtitle={
          <>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </>
        }
      />
      <CodeInput
        label="Verification code"
        value={code}
        isInvalid={isWrong}
        describedBy={isWrong ? 'verify-error' : undefined}
        onChange={(next) => {
          setCode(next);
          onCodeEdited();
        }}
      />
      {isWrong && (
        <p id="verify-error" role="alert" className={styles.errorLine}>
          <Icon name="alertCircle" size={16} strokeWidth={1.8} />
          That code doesn’t match. Check the latest email from Vela and try again.
        </p>
      )}
      {wasResent && (
        <p role="status" className={styles.sent}>
          <Icon name="check" size={16} strokeWidth={2.2} />
          New code sent to {email}. Earlier codes no longer work.
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        disabled={!isComplete || isWrong}
        loading={isSubmitting}
      >
        Verify email
      </Button>
      <div className={styles.linksRow}>
        <button type="button" className={styles.textButton} onClick={onWrongEmail}>
          Wrong email?
        </button>
        <button
          type="button"
          className={styles.textButton}
          disabled={secondsUntilResend > 0}
          onClick={() => {
            setCode('');
            onResend();
          }}
        >
          {secondsUntilResend > 0 ? `Resend code in ${formatCountdown(secondsUntilResend)}` : 'Resend code'}
        </button>
      </div>
    </form>
  );
}
