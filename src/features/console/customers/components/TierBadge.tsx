import clsx from 'clsx';

import type { CustomerTier } from '@/types/console/customer';

import styles from './TierBadge.module.css';

const TIER_CLASS: Record<CustomerTier, string> = {
  Platinum: styles.platinum,
  Gold: styles.gold,
  Silver: styles.silver,
  Member: styles.member,
};

/** Loyalty tier, darker as it climbs: Member, Silver, Gold (Brass), Platinum (Midnight). */
export function TierBadge({ tier }: { tier: CustomerTier }) {
  return <span className={clsx(styles.badge, TIER_CLASS[tier])}>{tier}</span>;
}
