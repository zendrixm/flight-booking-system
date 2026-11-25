import { Icon } from '@/components/icons';
import { Spinner } from '@/components/ui';
import type { PreparedExport } from '@/types/console/export';

import styles from './ExportStatus.module.css';

/** While an export file is being built. */
export function ExportPreparing({ fileName, summary }: { fileName?: string; summary?: string }) {
  return (
    <div role="status" aria-live="polite" className={styles.preparing}>
      <span className={styles.preparingTitle}>
        <Spinner size={16} />
        Preparing {fileName ?? 'your export'}…
      </span>
      <span className={styles.progress} aria-hidden="true">
        <span className={styles.progressBar} />
      </span>
      {summary && <span className={styles.summary}>{summary}</span>}
    </div>
  );
}

/** The finished file, ready to download. */
export function ExportReady({ file, title = 'Ready to download' }: { file: PreparedExport; title?: string }) {
  return (
    <div role="status" className={styles.ready}>
      <span className={styles.readyIcon} aria-hidden="true">
        <Icon name="check" size={18} strokeWidth={2.2} />
      </span>
      <span className={styles.readyText}>
        <span className={styles.readyTitle}>{title}</span>
        <span className={styles.fileName}>{file.fileName}</span>
        <span className={styles.summary}>
          {file.summary} · {file.sizeLabel}
        </span>
      </span>
    </div>
  );
}
