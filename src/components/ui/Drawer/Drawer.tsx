import clsx from 'clsx';
import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks';

import { IconButton } from '../IconButton';
import styles from './Drawer.module.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Extra content in the header under the title, e.g. status chips. */
  headerExtra?: ReactNode;
  /** Shown before the title, e.g. an avatar. */
  leading?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'default' | 'wide';
}

/** A side sheet for console details and forms. Focus is trapped while it is open. */
export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  description,
  headerExtra,
  leading,
  children,
  footer,
  size = 'default',
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(panelRef, open);
  useBodyScrollLock(open);
  useEscapeKey(onClose, open);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(styles.panel, size === 'wide' && styles.wide)}
      >
        <header className={styles.header}>
          {leading && <div className={styles.leading}>{leading}</div>}
          <div className={styles.titles}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.description}>{description}</p>}
            {headerExtra}
          </div>
          <IconButton icon="close" label="Close" variant="soft" onClick={onClose} />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
