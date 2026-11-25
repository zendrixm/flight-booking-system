import { Icon, type IconName } from '@/components/icons';
import { Button, Sheet } from '@/components/ui';

import styles from './ShareSheet.module.css';

export type ShareMethod = 'link' | 'email' | 'messages';

const SHARE_OPTIONS: ReadonlyArray<{
  method: ShareMethod;
  icon: IconName;
  label: string;
  description: string;
}> = [
  {
    method: 'link',
    icon: 'link',
    label: 'Copy link',
    description: 'Anyone with the link can view this pass',
  },
  { method: 'email', icon: 'mail', label: 'Email', description: 'Send a PDF copy' },
  {
    method: 'messages',
    icon: 'messageCircle',
    label: 'Messages',
    description: 'Share with someone you’re travelling with',
  },
];

interface ShareSheetProps {
  /** "MR 518 · Manila → Singapore · Sat, 10 Oct" */
  passLabel: string;
  onShare: (method: ShareMethod) => void;
  onClose: () => void;
}

export function ShareSheet({ passLabel, onShare, onClose }: ShareSheetProps) {
  return (
    <Sheet
      open
      onClose={onClose}
      title="Share boarding pass"
      description={passLabel}
      footer={
        <Button variant="quiet" size="large" fullWidth onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <ul className={styles.options}>
        {SHARE_OPTIONS.map((option) => (
          <li key={option.method}>
            <button type="button" className={styles.option} onClick={() => onShare(option.method)}>
              <span className={styles.iconTile} aria-hidden="true">
                <Icon name={option.icon} size={20} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{option.label}</span>
                <span className={styles.description}>{option.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
