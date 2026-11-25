import { Icon } from '@/components/icons';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './BookingSections.module.css';

export function FareRulesCard({ booking }: { booking: ManagedBooking }) {
  const rules = [
    {
      title: 'Changes allowed',
      body: '₱2,500 per traveler, plus any fare difference, up to 3 hours before departure.',
      icon: 'tag' as const,
      isGood: false,
    },
    {
      title: 'Fare is non-refundable',
      body: 'Taxes, carrier fees and unused add-ons are refunded if you cancel.',
      icon: 'xCircle' as const,
      isGood: false,
    },
    ...(booking.hasProtection
      ? [
          {
            title: 'Vela Protect active',
            body: 'Claim the full fare back if you cancel for a covered reason.',
            icon: 'shield' as const,
            isGood: true,
          },
        ]
      : []),
  ];

  return (
    <section className={styles.card} aria-labelledby="manage-rules-title">
      <h2 id="manage-rules-title" className={styles.title}>
        Your fare rules
      </h2>
      {rules.map((rule) => (
        <div key={rule.title} className={styles.rule}>
          <Icon
            name={rule.icon}
            size={18}
            className={rule.isGood ? `${styles.ruleIcon} ${styles.ruleGood}` : styles.ruleIcon}
          />
          <span className={styles.ruleText}>
            <span className={styles.ruleTitle}>{rule.title}</span>
            <span className={styles.ruleBody}>{rule.body}</span>
          </span>
        </div>
      ))}
    </section>
  );
}
