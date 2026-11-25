import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, type IconName } from '@/components/icons';
import { Button, LinkButton } from '@/components/ui';
import type { TravelAdvisory } from '@/types/help';

import { useHelpSupport } from '../state/helpSupportContext';
import styles from './HomeSections.module.css';

export function AdvisoryBanner({ advisory }: { advisory: TravelAdvisory }) {
  return (
    <div role="note" className={styles.advisory}>
      <span className={styles.advisoryIcon} aria-hidden="true">
        <Icon name="alertTriangle" size={20} strokeWidth={1.8} />
      </span>
      <span className={styles.advisoryText}>
        <span className={styles.advisoryTitle}>{advisory.title}</span>
        <span className={styles.advisoryDetail}>{advisory.detail}</span>
      </span>
      <LinkButton to={advisory.action.to} variant="secondary">
        {advisory.action.label}
      </LinkButton>
    </div>
  );
}

const QUICK_ACTIONS: ReadonlyArray<{ title: string; detail: string; icon: IconName; to: string }> = [
  {
    title: 'Manage a booking',
    detail: 'Change flights, seats or travelers',
    icon: 'edit',
    to: paths.findBooking,
  },
  {
    title: 'Check in online',
    detail: 'Opens 48 hours before departure',
    icon: 'ticket',
    to: paths.findBooking,
  },
  {
    title: 'Track a refund',
    detail: 'See exactly where your money is',
    icon: 'refresh',
    to: `${paths.help}#refund`,
  },
  { title: 'Get a receipt', detail: 'Download invoices for any trip', icon: 'receipt', to: paths.trips },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title" className={styles.section}>
      <h2 id="quick-actions-title" className={styles.sectionTitle}>
        Do it yourself in a minute
      </h2>
      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.title} to={action.to} className={styles.quickCard}>
            <span className={styles.quickIcon} aria-hidden="true">
              <Icon name={action.icon} size={22} strokeWidth={1.6} />
            </span>
            <span className={styles.quickText}>
              <span className={styles.quickTitle}>{action.title}</span>
              <span className={styles.quickDetail}>{action.detail}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ContactOptions() {
  const { openChat, openCallback, openMessage, callbackSummary } = useHelpSupport();
  return (
    <section aria-labelledby="contact-title" className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2 id="contact-title" className={styles.sectionTitle}>
          Still need a person?
        </h2>
        <p className={styles.sectionLead}>
          Travel specialists are available around the clock, in English and Filipino.
        </p>
      </div>
      <div className={styles.contactGrid}>
        <div className={styles.contactDark}>
          <span className={styles.online}>
            <span className={styles.onlineDot} aria-hidden="true" />
            Online · about 2 min
          </span>
          <span className={styles.contactText}>
            <span className={styles.contactTitle}>Chat with us</span>
            <span className={styles.contactDetailOnDark}>
              Fastest for changes, bags and anything on a trip in the next 48 hours.
            </span>
          </span>
          <Button variant="inverse" size="large" fullWidth onClick={openChat}>
            Start a chat
          </Button>
        </div>
        <div className={styles.contactCard}>
          <Icon name="smartphone" size={22} strokeWidth={1.6} />
          <span className={styles.contactText}>
            <span className={styles.contactTitle}>Request a call back</span>
            <span className={styles.contactDetail}>
              {callbackSummary
                ? `Done. ${callbackSummary}`
                : 'Leave the waiting to us. A specialist calls the number on your account within 15 minutes.'}
            </span>
          </span>
          <Button
            variant="quiet"
            size="large"
            fullWidth
            disabled={Boolean(callbackSummary)}
            onClick={openCallback}
          >
            {callbackSummary ? 'Call requested' : 'Call me back'}
          </Button>
        </div>
        <div className={styles.contactCard}>
          <Icon name="mail" size={22} strokeWidth={1.6} />
          <span className={styles.contactText}>
            <span className={styles.contactTitle}>Send a message</span>
            <span className={styles.contactDetail}>
              Best for receipts, invoices and anything with attachments. We reply within 24 hours.
            </span>
          </span>
          <Button variant="secondary" size="large" fullWidth onClick={() => openMessage()}>
            Write to us
          </Button>
        </div>
      </div>
    </section>
  );
}
