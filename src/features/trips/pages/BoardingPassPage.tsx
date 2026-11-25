import clsx from 'clsx';
import { useState } from 'react';
import { useParams } from 'react-router';

import { paths } from '@/app/paths';
import { BoardingPassCard } from '@/components/flight';
import { Icon } from '@/components/icons';
import { PageLoader } from '@/components/layout';
import { Breadcrumbs, Button, EmptyState, LinkButton, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatDayLabel } from '@/lib/date';
import * as boardingPasses from '@/services/boardingPassService';
import type { BoardingPass } from '@/types/boardingPass';

import { ChangeSeatDialog, UndoCheckInDialog, WalletDialog } from '../components/boarding/BoardingDialogs';
import { CheckedInSummary } from '../components/boarding/CheckedInSummary';
import { CheckInWizard } from '../components/boarding/CheckInWizard';
import { FlightStatusStrip } from '../components/boarding/FlightStatusStrip';
import styles from './BoardingPassPage.module.css';

type BoardingDialog = 'wallet' | 'seat' | 'undo' | null;

export function BoardingPassPage() {
  const { reference = '' } = useParams();
  const result = useAsyncData(`boarding-pass:${reference}`, () => boardingPasses.getBoardingPass(reference));
  useDocumentTitle(result.data ? `Check-in · ${result.data.to.city}` : 'Check-in');

  if (result.status === 'error') {
    return (
      <main className={styles.page}>
        <EmptyState
          icon="ticket"
          title="Check-in isn’t open for this booking"
          description={`Online check-in for ${reference} opens 48 hours before your first flight. We’ll email you when it does.`}
          actions={
            <>
              <LinkButton to={paths.trip(reference)} variant="primary">
                Manage booking
              </LinkButton>
              <LinkButton to={paths.trips} variant="secondary">
                Go to My trips
              </LinkButton>
            </>
          }
        />
      </main>
    );
  }
  if (!result.data) return <PageLoader label="Loading your check-in…" />;
  return <BoardingPassView key={reference} initialPass={result.data} />;
}

function BoardingPassView({ initialPass }: { initialPass: BoardingPass }) {
  const toast = useToast();
  const [pass, setPass] = useState(initialPass);
  const [dialog, setDialog] = useState<BoardingDialog>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { reference } = pass;

  /** Runs a change against the API, swaps in the updated pass and reports the outcome. */
  const save = async (operation: () => Promise<BoardingPass>, successMessage?: string) => {
    setIsSaving(true);
    try {
      setPass(await operation());
      setDialog(null);
      if (successMessage) toast.show({ tone: 'success', message: successMessage });
      return true;
    } catch {
      toast.show({ tone: 'error', message: 'That didn’t go through. Please try again.' });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const openWallet = async () => {
    if (pass.isInWallet || (await save(() => boardingPasses.addToWallet(reference)))) setDialog('wallet');
  };

  const download = async () => {
    try {
      const { fileName } = await boardingPasses.downloadBoardingPass(reference);
      toast.show({ tone: 'success', message: `Boarding pass downloaded · ${fileName}` });
    } catch {
      toast.show({ tone: 'error', message: 'We couldn’t prepare the PDF. Please try again.' });
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.main}>
          <div className={styles.heading}>
            <Breadcrumbs
              items={[
                { label: 'Home', to: paths.home },
                { label: 'My trips', to: paths.trips },
                { label: `${pass.to.city} · Check-in` },
              ]}
            />
            <h1 className={styles.title}>
              {pass.isCheckedIn ? 'You’re checked in' : `Check in for ${pass.to.city}`}
            </h1>
            <p className={styles.subtitle}>
              {formatDayLabel(pass.date)} · {pass.airlineName} {pass.flightNumber} · {pass.from.city} →{' '}
              {pass.to.city}
            </p>
          </div>

          <FlightStatusStrip pass={pass} />

          {pass.isCheckedIn ? (
            <CheckedInSummary
              pass={pass}
              onChangeSeat={() => setDialog('seat')}
              onUndo={() => setDialog('undo')}
            />
          ) : (
            <CheckInWizard
              pass={pass}
              isSubmitting={isSaving}
              onCheckIn={(seat) =>
                save(
                  () => boardingPasses.checkIn(reference, seat),
                  'You’re checked in — your boarding pass is ready',
                )
              }
            />
          )}
        </div>

        <aside className={styles.passColumn} aria-label="Boarding pass">
          <div className={styles.passFrame}>
            <div className={clsx(!pass.isCheckedIn && styles.locked)} inert={!pass.isCheckedIn}>
              <BoardingPassCard pass={pass} />
            </div>
            {!pass.isCheckedIn && (
              <div className={styles.lockOverlay}>
                <span className={styles.lockIcon} aria-hidden="true">
                  <Icon name="lock" size={22} strokeWidth={1.6} />
                </span>
                <span className={styles.lockText}>
                  Your boarding pass appears here once you’re checked in
                </span>
              </div>
            )}
          </div>
          <div className={styles.passActions}>
            <Button
              variant="primary"
              size="large"
              iconStart={pass.isInWallet ? 'check' : 'wallet'}
              disabled={!pass.isCheckedIn}
              aria-haspopup="dialog"
              className={styles.passAction}
              onClick={openWallet}
            >
              {pass.isInWallet ? 'In your wallet' : 'Add to wallet'}
            </Button>
            <Button
              variant="secondary"
              size="large"
              iconStart="download"
              disabled={!pass.isCheckedIn}
              className={styles.passAction}
              onClick={download}
            >
              Download PDF
            </Button>
          </div>
        </aside>
      </div>

      {dialog === 'wallet' && (
        <WalletDialog pass={pass} onClose={() => setDialog(null)} onDownload={download} />
      )}
      {dialog === 'seat' && (
        <ChangeSeatDialog
          pass={pass}
          isSaving={isSaving}
          onClose={() => setDialog(null)}
          onSave={(seat) =>
            save(
              () => boardingPasses.changeBoardingSeat(reference, seat),
              `Seat changed to ${seat} — boarding pass updated`,
            )
          }
        />
      )}
      {dialog === 'undo' && (
        <UndoCheckInDialog
          pass={pass}
          isSaving={isSaving}
          onClose={() => setDialog(null)}
          onConfirm={() =>
            save(
              () => boardingPasses.undoCheckIn(reference),
              `Check-in undone — check in again before ${pass.bagDropCloses} to fly`,
            )
          }
        />
      )}
    </main>
  );
}
