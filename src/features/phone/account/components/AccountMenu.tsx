import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';

import { Icon, type IconName } from '@/components/icons';
import { Switch } from '@/components/ui';

import styles from './AccountMenu.module.css';

/** A titled, rounded group of account rows: "ACCOUNT", "PREFERENCES", "SUPPORT". */
export function AccountMenuGroup({ title, children }: { title: string; children: ReactNode }) {
  const titleId = useId();
  return (
    <section className={styles.group} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.groupTitle}>
        {title}
      </h2>
      <ul className={styles.rows}>{children}</ul>
    </section>
  );
}

interface AccountLinkRowProps {
  icon: IconName;
  label: string;
  /** Right-aligned detail, e.g. "4 people". */
  meta?: string;
  to: string;
}

export function AccountLinkRow({ icon, label, meta, to }: AccountLinkRowProps) {
  return (
    <li>
      <Link to={to} className={styles.row}>
        <Icon name={icon} size={20} className={styles.icon} />
        <span className={styles.label}>{label}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
        <Icon name="chevronRight" size={16} className={styles.chevron} />
      </Link>
    </li>
  );
}

interface AccountSwitchRowProps {
  icon: IconName;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AccountSwitchRow({ icon, label, description, checked, onChange }: AccountSwitchRowProps) {
  return (
    <li className={styles.row}>
      <Icon name={icon} size={20} className={styles.icon} />
      <Switch
        className={styles.switch}
        label={label}
        description={description}
        placement="end"
        checked={checked}
        onChange={onChange}
      />
    </li>
  );
}
