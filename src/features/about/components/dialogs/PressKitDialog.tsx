import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, Dialog, useToast } from '@/components/ui';
import { PRESS_ASSETS, PRESS_EMAIL } from '@/mocks/company';
import { downloadPressAsset } from '@/services/companyService';
import { ApiError } from '@/services/mockApi';

import styles from './AboutDialogs.module.css';

interface PressKitDialogProps {
  onClose: () => void;
}

export function PressKitDialog({ onClose }: PressKitDialogProps) {
  const toast = useToast();
  const [downloadedIds, setDownloadedIds] = useState<ReadonlySet<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const download = async (assetId: string) => {
    setBusyId(assetId);
    try {
      const { fileName } = await downloadPressAsset(assetId);
      setDownloadedIds((previous) => new Set(previous).add(assetId));
      toast.show({ tone: 'success', message: `Downloaded ${fileName}` });
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Download failed. Try again.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Press kit"
      description="Logos, product images and company facts, free to use in coverage of Vela."
    >
      <ul className={styles.list}>
        {PRESS_ASSETS.map((asset) => {
          const isDownloaded = downloadedIds.has(asset.id);
          return (
            <li key={asset.id} className={styles.assetRow}>
              <span className={styles.assetIcon} aria-hidden="true">
                <Icon name="fileDownload" size={20} />
              </span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{asset.name}</span>
                <span className={styles.rowMeta}>{asset.description}</span>
              </span>
              <Button
                variant="quiet"
                size="small"
                iconStart={isDownloaded ? 'check' : 'download'}
                aria-label={`Download ${asset.name}`}
                loading={busyId === asset.id}
                onClick={() => download(asset.id)}
              >
                {isDownloaded ? 'Downloaded' : 'Download'}
              </Button>
            </li>
          );
        })}
      </ul>
      <p className={styles.note}>
        For interviews, write to <a href={`mailto:${PRESS_EMAIL}`}>{PRESS_EMAIL}</a> — we reply within one
        working day.
      </p>
    </Dialog>
  );
}
