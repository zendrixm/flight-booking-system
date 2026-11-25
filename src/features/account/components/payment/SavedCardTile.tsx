import clsx from 'clsx';

import { Button } from '@/components/ui';
import type { SavedCard } from '@/types/payment';

import styles from './SavedCardTile.module.css';

interface SavedCardTileProps {
  card: SavedCard;
  isDefault: boolean;
  isExpired: boolean;
  onMakeDefault: () => void;
  onRemove: () => void;
}

/** A Midnight card face with the actions that apply to it underneath. */
export function SavedCardTile({ card, isDefault, isExpired, onMakeDefault, onRemove }: SavedCardTileProps) {
  const description = `${card.kind} card ending ${card.last4}, expires ${card.expiry}${isDefault ? ', default' : ''}${
    isExpired ? ', expired' : ''
  }`;

  return (
    <div className={styles.tile}>
      <div
        role="img"
        aria-label={description}
        className={clsx(styles.face, isDefault && styles.default, isExpired && styles.expired)}
      >
        <div className={styles.topRow}>
          <span className={styles.chip} aria-hidden="true">
            <span className={styles.chipInner} />
          </span>
          {isDefault ? (
            <span className={styles.defaultBadge}>Default</span>
          ) : isExpired ? (
            <span className={styles.expiredBadge}>Expired</span>
          ) : (
            <span className={styles.kind}>{card.kind}</span>
          )}
        </div>
        <span className={styles.number}>•••• •••• •••• {card.last4}</span>
        <div className={styles.bottomRow}>
          <span className={styles.detail}>
            <span className={styles.detailLabel}>Card holder</span>
            <span className={styles.holder}>{card.holderName}</span>
          </span>
          <span className={styles.detailEnd}>
            <span className={styles.detailLabel}>Expires</span>
            <span className={styles.expiry}>{card.expiry}</span>
          </span>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.usage}>{card.usageNote}</span>
        <span className={styles.actions}>
          <Button variant="ghost" size="small" disabled={isDefault || isExpired} onClick={onMakeDefault}>
            {isDefault ? 'Default card' : 'Make default'}
          </Button>
          <Button
            variant="destructiveGhost"
            size="small"
            disabled={isDefault}
            aria-label={`Remove card ending ${card.last4}`}
            aria-haspopup="dialog"
            onClick={onRemove}
          >
            Remove
          </Button>
        </span>
      </div>
    </div>
  );
}
