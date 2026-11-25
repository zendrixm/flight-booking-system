import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { paths } from '@/app/paths';
import { currencyOf, languageOf, usePreferences, useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Avatar, IconButton, LinkButton, Logo } from '@/components/ui';
import { useDisclosure } from '@/hooks';
import { initialsOf } from '@/lib/format';

import { AccountMenu } from './AccountMenu';
import { LocaleDialog } from './LocaleDialog';
import { MobileMenuSheet } from './MobileMenuSheet';
import styles from './SiteHeader.module.css';
import { PRIMARY_NAV, sectionForPath } from './siteNavigation';

export function SiteHeader() {
  const { pathname } = useLocation();
  const activeSection = sectionForPath(pathname);
  const { customer } = useSession();
  const { currency, language } = usePreferences();
  const localeDialog = useDisclosure();
  const mobileMenu = useDisclosure();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const currencyInfo = currencyOf(currency);
  const languageInfo = languageOf(language);

  function openLocaleDialog() {
    mobileMenu.close();
    setAccountMenuOpen(false);
    localeDialog.open();
  }

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Logo to={paths.home} label="Vela home" />

        <nav aria-label="Primary" className={styles.nav}>
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.section}
              to={item.to}
              className={styles.navLink}
              aria-current={activeSection === item.section ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.localeButton}
            aria-haspopup="dialog"
            aria-label={`Currency and language: ${currencyInfo.name}, ${languageInfo.name}`}
            onClick={openLocaleDialog}
          >
            <Icon name="globe" />
            {currencyInfo.code} {currencyInfo.symbol} · {languageInfo.code}
          </button>

          {customer ? (
            <AccountMenu
              open={accountMenuOpen}
              onOpenChange={(open) => {
                setAccountMenuOpen(open);
                if (open) mobileMenu.close();
              }}
              customer={customer}
              trigger={(triggerProps) => (
                <button
                  {...triggerProps}
                  type="button"
                  className={styles.accountButton}
                  aria-label={`Account menu for ${customer.firstName} ${customer.lastName}`}
                >
                  <Avatar initials={initialsOf(`${customer.firstName} ${customer.lastName}`)} size={32} />
                  <span className={styles.accountName}>{customer.firstName}</span>
                  <Icon name="chevronDown" size={14} strokeWidth={1.8} className={styles.chevron} />
                </button>
              )}
            />
          ) : (
            <LinkButton to={paths.signIn} variant="inverse" className={styles.signIn}>
              Sign in
            </LinkButton>
          )}

          <IconButton
            icon={mobileMenu.isOpen ? 'close' : 'menu'}
            label={mobileMenu.isOpen ? 'Close menu' : 'Open menu'}
            variant="inverse"
            shape="square"
            aria-expanded={mobileMenu.isOpen}
            aria-controls="site-menu-sheet"
            className={styles.menuButton}
            onClick={() => {
              setAccountMenuOpen(false);
              mobileMenu.toggle();
            }}
          />
        </div>
      </div>

      <MobileMenuSheet
        id="site-menu-sheet"
        open={mobileMenu.isOpen}
        onClose={mobileMenu.close}
        activeSection={activeSection}
        onOpenLocale={openLocaleDialog}
        localeLabel={`${currencyInfo.name} (${currencyInfo.symbol}) · ${languageInfo.name}`}
      />
      <LocaleDialog open={localeDialog.isOpen} onClose={localeDialog.close} />
    </header>
  );
}
