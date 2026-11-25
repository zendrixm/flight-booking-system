import clsx from 'clsx';

import { Icon } from '@/components/icons';
import { passwordStrength, requiredPasswordChecks } from '@/lib/password';

import styles from './PasswordStrength.module.css';

interface PasswordStrengthProps {
  password: string;
  id: string;
}

const TONE_BY_SCORE = ['weak', 'weak', 'fair', 'strong', 'strong'] as const;

/** Four bars and the rules a new password must meet; the symbol rule is a recommendation only. */
export function PasswordStrength({ password, id }: PasswordStrengthProps) {
  const score = passwordStrength(password);
  const tone = TONE_BY_SCORE[score];
  const checks = [
    ...requiredPasswordChecks(password),
    { label: 'A symbol (recommended)', isMet: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className={styles.strength}>
      <div className={styles.bars} aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={clsx(styles.bar, password && index < Math.max(1, score) && styles[tone])}
          />
        ))}
      </div>
      <ul id={id} className={styles.rules}>
        {checks.map((check) => (
          <li key={check.label} className={check.isMet ? styles.met : styles.rule}>
            <Icon name={check.isMet ? 'check' : 'minus'} size={14} strokeWidth={2.2} />
            {check.label}
            <span className="visually-hidden">{check.isMet ? ' — met' : ' — not met yet'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
