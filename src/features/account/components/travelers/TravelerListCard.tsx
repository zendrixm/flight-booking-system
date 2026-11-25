import clsx from 'clsx';

import { Icon } from '@/components/icons';
import { StatusChip } from '@/components/ui';

import type { StatusLabel } from '../../lib/travelerProfile';
import styles from './TravelerListCard.module.css';

interface TravelerListCardProps {
  name: string;
  kind: string;
  initials: string;
  chips: StatusLabel[];
  isSelected: boolean;
  /** Brass avatar for the signed-in person. */
  isAccountHolder?: boolean;
  /** Dashed avatar for a traveler that isn't saved yet. */
  isDraft?: boolean;
  onSelect: () => void;
}

export function TravelerListCard({
  name,
  kind,
  initials,
  chips,
  isSelected,
  isAccountHolder,
  isDraft,
  onSelect,
}: TravelerListCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={clsx(styles.card, isSelected && styles.selected)}
      onClick={onSelect}
    >
      <span className={styles.identity}>
        <span
          aria-hidden="true"
          className={clsx(styles.avatar, isAccountHolder && styles.accountHolder, isDraft && styles.draft)}
        >
          {initials}
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          <span className={styles.kind}>{kind}</span>
        </span>
        <Icon name="chevronRight" size={18} strokeWidth={1.8} className={styles.chevron} />
      </span>
      <span className={styles.chips}>
        {chips.map((chip) => (
          <StatusChip key={chip.label} tone={chip.tone} size="compact">
            {chip.label}
          </StatusChip>
        ))}
      </span>
    </button>
  );
}
