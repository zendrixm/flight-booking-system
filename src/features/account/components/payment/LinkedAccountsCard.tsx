import { Icon, type IconName } from '@/components/icons';
import { Button } from '@/components/ui';
import { formatShortDate } from '@/lib/date';
import type { LinkedBankAccount, LinkedWallet } from '@/types/payment';

import { maskMobileNumber } from '../../lib/paymentMethodForms';
import styles from './LinkedAccountsCard.module.css';

interface LinkedAccountsCardProps {
  wallet: LinkedWallet | null;
  bankAccount: LinkedBankAccount | null;
  onLinkWallet: () => void;
  onUnlinkWallet: () => void;
  onLinkBank: () => void;
  onUnlinkBank: () => void;
}

interface AccountRow {
  id: string;
  icon: IconName;
  name: string;
  detail: string;
  isLinked: boolean;
  actionLabel: string;
  onAction: () => void;
}

export function LinkedAccountsCard({
  wallet,
  bankAccount,
  onLinkWallet,
  onUnlinkWallet,
  onLinkBank,
  onUnlinkBank,
}: LinkedAccountsCardProps) {
  const rows: AccountRow[] = [
    {
      id: 'wallet',
      icon: 'smartphone',
      name: 'Mobile e-wallet',
      detail: wallet
        ? `${maskMobileNumber(wallet.mobileNumber)} · linked ${formatShortDate(wallet.linkedOn)}`
        : 'Not linked',
      isLinked: Boolean(wallet),
      actionLabel: wallet ? 'Unlink' : 'Link',
      onAction: wallet ? onUnlinkWallet : onLinkWallet,
    },
    {
      id: 'bank',
      icon: 'bank',
      name: bankAccount?.bankName ?? 'Online banking',
      detail: bankAccount
        ? `${bankAccount.accountLabel} · linked ${formatShortDate(bankAccount.linkedOn)} · approve each payment in your bank’s app`
        : 'Pay from your bank account without a card',
      isLinked: Boolean(bankAccount),
      actionLabel: bankAccount ? 'Unlink' : 'Link a bank',
      onAction: bankAccount ? onUnlinkBank : onLinkBank,
    },
  ];

  return (
    <div className={styles.list}>
      {rows.map((row) => (
        <div key={row.id} className={styles.row}>
          <span className={styles.icon} aria-hidden="true">
            <Icon name={row.icon} size={20} strokeWidth={1.6} />
          </span>
          <span className={styles.text}>
            <span className={styles.name}>{row.name}</span>
            <span className={styles.detail}>{row.detail}</span>
          </span>
          <Button
            variant={row.isLinked ? 'destructiveQuiet' : 'primary'}
            aria-haspopup="dialog"
            aria-label={row.isLinked ? `Unlink ${row.name}` : undefined}
            onClick={row.onAction}
          >
            {row.actionLabel}
          </Button>
        </div>
      ))}
    </div>
  );
}
