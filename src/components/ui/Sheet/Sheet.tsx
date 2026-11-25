import clsx from 'clsx';
import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks';

import { IconButton } from '../IconButton';
import styles from './Sheet.module.css';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** One line under the title, e.g. the trip the sheet acts on. */
  description?: ReactNode;
  /** Takes the place of the close button, e.g. a "Reset" action. */
  headerAction?: ReactNode;
  /** Stays pinned under the title while the body scrolls: a search box, tabs, weekday initials. */
  headerExtra?: ReactNode;
  children: ReactNode;
  /** Pinned under the body, for the sheet's main action. */
  footer?: ReactNode;
  /** `tall` fills most of the screen, for long lists; `auto` fits the content. */
  height?: 'auto' | 'tall';
  /** Hairlines between the pinned header, the scrolling body and the footer. */
  divided?: boolean;
  role?: 'dialog' | 'alertdialog';
  className?: string;
}

/**
 * The phone app's bottom sheet: slides up over a scrim, closes on Escape, the scrim or the close
 * button, and keeps focus inside while open.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  headerAction,
  headerExtra,
  children,
  footer,
  height = 'auto',
  divided = false,
  role = 'dialog',
  className,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

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
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={clsx(styles.sheet, height === 'tall' && styles.tall, className)}
      >
        <div className={clsx(styles.header, divided && styles.headerDivided)}>
          <span className={styles.grabber} aria-hidden="true" />
          <div className={styles.titleRow}>
            <div className={styles.titleText}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {headerAction ?? <IconButton icon="close" label="Close" variant="soft" onClick={onClose} />}
          </div>
          {headerExtra}
        </div>
        <div className={clsx(styles.body, !footer && styles.bodyLast)}>{children}</div>
        {footer && <div className={clsx(styles.footer, divided && styles.footerDivided)}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
