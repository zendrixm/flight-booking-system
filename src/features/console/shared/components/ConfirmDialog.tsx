import type { ReactNode } from 'react';

import { Button, Dialog } from '@/components/ui';

import styles from './ConfirmDialog.module.css';
import { SummaryList, type SummaryRow } from './SummaryList';

export interface ConfirmDialogContent {
  /** `alertdialog` for anything destructive or hard to undo. */
  role: 'dialog' | 'alertdialog';
  title: string;
  /** One line under the title naming what is affected. */
  subtitle?: string;
  body: string;
  rows?: readonly SummaryRow[];
  cancelLabel: string;
  confirmLabel: string;
  isDestructive: boolean;
}

interface ConfirmDialogProps {
  /** Null keeps the dialog closed. */
  content: ConfirmDialogContent | null;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Extra detail under the summary, e.g. a quoted note. */
  children?: ReactNode;
}

/** The console's confirmation: what will happen, the facts it affects, and two clear choices. */
export function ConfirmDialog({ content, isBusy = false, onClose, onConfirm, children }: ConfirmDialogProps) {
  return (
    <Dialog
      open={content !== null}
      onClose={onClose}
      role={content?.role}
      size="medium"
      title={content?.title}
      description={content?.subtitle}
      busy={isBusy}
      dismissible={!isBusy}
      footer={
        content && (
          <>
            <Button variant="quiet" disabled={isBusy} onClick={onClose}>
              {content.cancelLabel}
            </Button>
            <Button
              variant={content.isDestructive ? 'destructive' : 'primary'}
              loading={isBusy}
              onClick={onConfirm}
            >
              {content.confirmLabel}
            </Button>
          </>
        )
      }
    >
      {content && (
        <div className={styles.body}>
          <p className={styles.message}>{content.body}</p>
          {content.rows && <SummaryList rows={content.rows} />}
          {children}
        </div>
      )}
    </Dialog>
  );
}
