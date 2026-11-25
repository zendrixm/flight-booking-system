import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, type IconName } from '@/components/icons';
import { LinkButton } from '@/components/ui';

import { AuthHeading } from '../AuthHeading';
import styles from './SignUp.module.css';

const NEXT_STEPS: ReadonlyArray<{ to: string; icon: IconName; title: string; detail: string }> = [
  {
    to: paths.account.travelers,
    icon: 'users',
    title: 'Add the people you travel with',
    detail: 'Names and passports fill in at checkout',
  },
  {
    to: paths.account.priceAlerts,
    icon: 'bell',
    title: 'Watch a route',
    detail: 'We’ll tell you when the price drops',
  },
];

export function WelcomeStep({ firstName }: { firstName: string }) {
  return (
    <div className={styles.form}>
      <AuthHeading
        badge={{ icon: 'check', tone: 'success' }}
        title={`Welcome to Vela, ${firstName}.`}
        subtitle="Your account is ready. Two things that make your first booking faster:"
      />
      <div className={styles.voucher}>
        <span className={styles.code}>WELCOME</span>
        <span>₱500 off your first booking. It’s already saved to your account.</span>
      </div>
      <div className={styles.nextSteps}>
        {NEXT_STEPS.map((step) => (
          <Link key={step.to} to={step.to} className={styles.nextStep}>
            <Icon name={step.icon} size={20} strokeWidth={1.6} />
            <span className={styles.nextStepText}>
              <span className={styles.nextStepTitle}>{step.title}</span>
              <span className={styles.nextStepDetail}>{step.detail}</span>
            </span>
            <Icon name="chevronRight" size={18} strokeWidth={1.8} />
          </Link>
        ))}
      </div>
      <LinkButton to={paths.home} variant="primary" size="large" fullWidth>
        Start searching flights
      </LinkButton>
    </div>
  );
}
