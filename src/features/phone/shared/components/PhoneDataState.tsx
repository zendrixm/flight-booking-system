import { PageLoader } from '@/components/layout';
import { Alert, Button } from '@/components/ui';
import type { AsyncStatus } from '@/hooks';

interface PhoneDataStateProps {
  status: AsyncStatus;
  /** "your trips" → "Loading your trips…" / "We couldn’t load your trips". */
  subject: string;
  onRetry: () => void;
}

/** What a phone screen shows until its data arrives: a spinner, or an error with "Try again". */
export function PhoneDataState({ status, subject, onRetry }: PhoneDataStateProps) {
  if (status !== 'error') return <PageLoader label={`Loading ${subject}…`} />;
  return (
    <Alert
      tone="danger"
      role="alert"
      title={`We couldn’t load ${subject}`}
      action={
        <Button variant="quiet" size="small" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      Check your connection, then try again.
    </Alert>
  );
}
