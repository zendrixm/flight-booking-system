import { useRef } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Avatar, LinkButton } from '@/components/ui';
import { useEscapeKey, useFocusTrap } from '@/hooks';
import { initialsOf } from '@/lib/format';

import styles from './MobileMenuSheet.module.css';
import { PRIMARY_NAV, type SiteSection } from './siteNavigation';

interface MobileMenuSheetProps {
  id: string;
  open: boolean;
  onClose: () => void;
  activeSection: SiteSection;
  onOpenLocale: () => void;
  localeLabel: string;
}

/** Below 760px the primary navigation moves into this sheet, opened from the header's menu button. */
export function MobileMenuSheet({
  id,
  open,
  onClose,
  activeSection,
  onOpenLocale,
  localeLabel,
}: MobileMenuSheetProps) {
  const { customer } = useSession();
  const sheetRef = useRef<HTMLElement>(null);

  useEscapeKey(onClose, open);
  useFocusTrap(sheetRef, open);

  if (!open) return null;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <nav ref={sheetRef} id={id} aria-label="Menu" className={styles.sheet}>
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.section}
            to={item.to}
            className={styles.link}
            aria-current={activeSection === item.section ? 'page' : undefined}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}

        <span aria-hidden="true" className={styles.separator} />

        {customer ? (
          <>
            <Link
              to={paths.account.settings}
              className={`${styles.link} ${styles.secondaryLink}`}
              onClick={onClose}
            >
              <Avatar initials={initialsOf(`${customer.firstName} ${customer.lastName}`)} size={32} />
              <span className={styles.accountText}>
                <span>
                  {customer.firstName} {customer.lastName}
                </span>
                <span className={styles.accountSub}>Account settings</span>
              </span>
            </Link>
            <Link to={paths.signOut} className={`${styles.link} ${styles.secondaryLink}`} onClick={onClose}>
              Sign out
            </Link>
          </>
        ) : (
          <div className={styles.authButtons}>
            <LinkButton to={paths.signIn} size="large" onClick={onClose}>
              Sign in
            </LinkButton>
            <LinkButton to={paths.createAccount} variant="quiet" size="large" onClick={onClose}>
              Create account
            </LinkButton>
          </div>
        )}

        <button type="button" className={`${styles.link} ${styles.localeLink}`} onClick={onOpenLocale}>
          <Icon name="globe" />
          {localeLabel}
        </button>
      </nav>
    </div>
  );
}
