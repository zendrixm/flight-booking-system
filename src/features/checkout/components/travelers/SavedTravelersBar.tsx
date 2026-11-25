import { Avatar, Button } from '@/components/ui';
import { initialsOf } from '@/lib/format';
import type { SavedTraveler, TravelerDetails } from '@/types/traveler';

import { matchesSaved } from '../../lib/travelerDefaults';
import styles from './SavedTravelersBar.module.css';

interface SavedTravelersBarProps {
  accountName: string;
  savedTravelers: readonly SavedTraveler[];
  travelers: readonly TravelerDetails[];
  onUse: (saved: SavedTraveler) => void;
}

/** "Signed in as Andrea Reyes. Fill in from your saved travelers:" with one button per saved traveler. */
export function SavedTravelersBar({ accountName, savedTravelers, travelers, onUse }: SavedTravelersBarProps) {
  const hasFreeSlot = travelers.some((traveler) => !traveler.firstNames && !traveler.lastName);

  return (
    <div className={styles.bar}>
      <Avatar initials={initialsOf(accountName)} />
      <p className={styles.text}>
        Signed in as <strong>{accountName}</strong>. Fill in from your saved travelers:
      </p>
      <div className={styles.buttons}>
        {savedTravelers.map((saved) => {
          const name = `${saved.firstNames.split(' ')[0]} ${saved.lastName}`;
          const isFilled = travelers.some((traveler) => matchesSaved(traveler, saved));
          return (
            <Button
              key={saved.id}
              size="small"
              variant="quiet"
              className={isFilled ? styles.filled : undefined}
              iconStart={isFilled ? 'check' : 'plus'}
              aria-pressed={isFilled}
              disabled={!isFilled && !hasFreeSlot}
              aria-label={
                isFilled
                  ? `${name}’s saved details are filled in`
                  : `Fill the next traveler with ${name}’s saved details`
              }
              onClick={() => {
                if (!isFilled) onUse(saved);
              }}
            >
              {isFilled ? `${name} · filled` : name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
