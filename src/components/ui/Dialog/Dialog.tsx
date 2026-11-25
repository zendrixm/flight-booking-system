import clsx from 'clsx';
import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Icon, type IconName } from '@/components/icons';
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks';

import { IconButton } from '../IconButton';
import styles from './Dialog.module.css';

export type DialogIconTone = 'danger' | 'success' | 'successSolid' | 'attention' | 'neutral';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Small uppercase line above the title, e.g. "Link a bank · step 2 of 3". Dialogs without an icon only. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Shown in the title row, never on a row of its own. */
  icon?: IconName;
  iconTone?: DialogIconTone;
  /** Replaces the icon, e.g. with a spinner while something is processing. */
  iconSlot?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'wide';
  /** Use `alertdialog` for confirmations that interrupt the person. */
  role?: 'dialog' | 'alertdialog';
  /** When false, Escape and clicks on the scrim do nothing (e.g. while a payment is processing). */
  dismissible?: boolean;
  hideCloseButton?: boolean;
  busy?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  description,
  icon,
  iconTone = 'neutral',
  iconSlot,
  children,
  footer,
  size = 'large',
  role = 'dialog',
  dismissible = true,
  hideCloseButton = false,
  busy,
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(panelRef, open);
  useBodyScrollLock(open);
  useEscapeKey(onClose, open && dismissible);

  if (!open) return null;

  // Confirmations put their icon beside the title and the message below; form dialogs keep
  // the description as a subtitle under the title.
  const hasIcon = Boolean(iconSlot || icon);
  const closeButton = dismissible && !hideCloseButton && (
    <IconButton icon="close" label="Close" variant="soft" onClick={onClose} />
  );

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className={clsx(styles.panel, styles[size], className)}
      >
        {hasIcon ? (
          <>
            <div className={styles.header}>
              {iconSlot ??
                (icon && (
                  <span className={clsx(styles.iconBadge, styles[iconTone])}>
                    <Icon name={icon} size={20} strokeWidth={1.8} />
                  </span>
                ))}
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {closeButton}
            </div>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </>
        ) : (
          <div className={clsx(styles.header, styles.headerTop)}>
            <div className={styles.headerText}>
              {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className={styles.subtitle}>
                  {description}
                </p>
              )}
            </div>
            {closeButton}
          </div>
        )}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
