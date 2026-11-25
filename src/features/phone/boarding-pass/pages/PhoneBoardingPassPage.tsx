import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Button, EmptyState, IconButton, LinkButton, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatDayLabel } from '@/lib/date';
import { addToWallet, getBoardingPass } from '@/services/boardingPassService';
import { ApiError } from '@/services/mockApi';

import { PhoneDataState } from '../../shared/components/PhoneDataState';
import { BarcodeScreen } from '../components/BarcodeScreen';
import { PhonePassCard } from '../components/PhonePassCard';
import { ShareSheet, type ShareMethod } from '../components/ShareSheet';
import { WalletAddedSheet } from '../components/WalletAddedSheet';
import styles from './PhoneBoardingPassPage.module.css';

type PassOverlay = 'barcode' | 'share' | 'wallet' | null;

export function PhoneBoardingPassPage() {
  useDocumentTitle('Boarding pass');
  const { reference = '' } = useParams();
  const toast = useToast();
  const { customer } = useSession();
  const boardingPass = useAsyncData(`phone-boarding-pass-${reference}`, () => getBoardingPass(reference));
  const [overlay, setOverlay] = useState<PassOverlay>(null);
  const [isAddingToWallet, setIsAddingToWallet] = useState(false);
  const pass = boardingPass.data;
  const closeOverlay = () => setOverlay(null);

  const header = (
    <header className={styles.header}>
      <Link to={paths.phone.trips} aria-label="Close" className={styles.headerButton}>
        <Icon name="close" size={22} />
      </Link>
      <h1 className={styles.title}>Boarding pass</h1>
      {pass?.isCheckedIn ? (
        <IconButton
          icon="share"
          label="Share"
          variant="ghostInverse"
          aria-haspopup="dialog"
          onClick={() => setOverlay('share')}
        />
      ) : (
        <span className={styles.headerSpacer} aria-hidden="true" />
      )}
    </header>
  );

  if (!pass) {
    const isNotFound = boardingPass.error instanceof ApiError && boardingPass.error.code === 'not_found';
    return (
      <div className={styles.screen}>
        {header}
        <div className={styles.messageCard}>
          {isNotFound ? (
            <EmptyState
              icon="ticket"
              title="No boarding pass yet"
              description="Boarding passes appear here once check-in opens, 48 hours before departure."
              actions={
                <LinkButton to={paths.phone.trips} size="small">
                  Back to trips
                </LinkButton>
              }
            />
          ) : (
            <PhoneDataState
              status={boardingPass.status}
              subject="your boarding pass"
              onRetry={boardingPass.reload}
            />
          )}
        </div>
      </div>
    );
  }

  if (!pass.isCheckedIn) {
    return (
      <div className={styles.screen}>
        {header}
        <div className={styles.messageCard}>
          <EmptyState
            icon="ticket"
            title="Check in to get your boarding pass"
            description={`Online check-in for ${pass.flightNumber} closes at ${pass.bagDropCloses}.`}
            actions={
              <LinkButton to={paths.boardingPass(pass.reference)} size="small">
                Check in
              </LinkButton>
            }
          />
        </div>
      </div>
    );
  }

  const share = async (method: ShareMethod) => {
    closeOverlay();
    if (method === 'link') {
      const url = `${window.location.origin}${paths.phone.boardingPass(pass.reference)}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.show({ tone: 'success', message: 'Link copied' });
      } catch {
        toast.show({ tone: 'error', message: 'Couldn’t copy the link. Try again.' });
      }
      return;
    }
    toast.show({
      tone: 'success',
      message: method === 'email' ? `Emailed to ${customer?.email ?? 'you'}` : 'Shared to Messages',
    });
  };

  const addPassToWallet = async () => {
    if (pass.isInWallet) {
      setOverlay('wallet');
      return;
    }
    setIsAddingToWallet(true);
    try {
      boardingPass.mutate(await addToWallet(pass.reference));
      setOverlay('wallet');
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Couldn’t add the pass. Try again.',
      });
    } finally {
      setIsAddingToWallet(false);
    }
  };

  return (
    <div className={styles.screen}>
      {header}
      <main className={styles.content}>
        <PhonePassCard pass={pass} onShowBarcode={() => setOverlay('barcode')} />
        <p className={styles.tip}>
          <Icon name="sun" size={16} />
          <span>Turn up your screen brightness at the gate. Boarding closes {pass.gateCloses}.</span>
        </p>
        <Button
          variant="inverse"
          size="large"
          fullWidth
          iconStart={pass.isInWallet ? 'check' : 'wallet'}
          loading={isAddingToWallet}
          onClick={() => void addPassToWallet()}
        >
          {pass.isInWallet ? 'In your wallet' : 'Add to wallet'}
        </Button>
      </main>

      {overlay === 'barcode' && <BarcodeScreen pass={pass} onClose={closeOverlay} />}
      {overlay === 'share' && (
        <ShareSheet
          passLabel={`${pass.flightNumber} · ${pass.from.city} → ${pass.to.city} · ${formatDayLabel(pass.date)}`}
          onShare={(method) => void share(method)}
          onClose={closeOverlay}
        />
      )}
      {overlay === 'wallet' && <WalletAddedSheet pass={pass} onClose={closeOverlay} />}
    </div>
  );
}
