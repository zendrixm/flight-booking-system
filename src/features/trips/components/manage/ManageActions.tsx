import clsx from 'clsx';

import { Icon, type IconName } from '@/components/icons';

import styles from './ManageActions.module.css';

export type ManageAction = 'change' | 'seats' | 'bags' | 'assist' | 'checkin' | 'cancel';

interface ManageActionsProps {
  isDisabled: boolean;
  seatsSummary: string;
  bagsSummary: string;
  assistanceSummary: string;
  checkInSummary: string;
  onSelect: (action: ManageAction) => void;
}

/** The six things people come to Manage booking to do, as large tiles. */
export function ManageActions({
  isDisabled,
  seatsSummary,
  bagsSummary,
  assistanceSummary,
  checkInSummary,
  onSelect,
}: ManageActionsProps) {
  const actions: Array<{
    id: ManageAction;
    label: string;
    description: string;
    icon: IconName;
    isDanger?: boolean;
  }> = [
    {
      id: 'change',
      label: 'Change flights',
      description: '₱2,500 per traveler + difference',
      icon: 'arrowsSwap',
    },
    { id: 'seats', label: 'Change seats', description: seatsSummary, icon: 'seat' },
    { id: 'bags', label: 'Add bags', description: bagsSummary, icon: 'luggage' },
    { id: 'assist', label: 'Special assistance', description: assistanceSummary, icon: 'accessibility' },
    { id: 'checkin', label: 'Check in', description: checkInSummary, icon: 'ticket' },
    {
      id: 'cancel',
      label: 'Cancel trip',
      description: 'See your refund before confirming',
      icon: 'xCircle',
      isDanger: true,
    },
  ];

  return (
    <section className={styles.grid} aria-label="Manage">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={clsx(styles.tile, action.isDanger && styles.danger)}
          disabled={isDisabled}
          aria-haspopup="dialog"
          onClick={() => onSelect(action.id)}
        >
          <Icon name={action.icon} size={22} />
          <span className={styles.text}>
            <span className={styles.label}>{action.label}</span>
            <span className={styles.description}>{action.description}</span>
          </span>
        </button>
      ))}
    </section>
  );
}
