import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

import styles from './SettingsLayout.module.css';

interface SettingsCardProps {
  title: string;
  description?: ReactNode;
  /** Right side of the title row: a summary, link or action. */
  aside?: ReactNode;
  children: ReactNode;
}

/** One group of related settings. */
export function SettingsCard({ title, description, aside, children }: SettingsCardProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** Fields side by side, wrapping to one column on narrow screens. */
export function SettingsGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

interface SettingsRowProps {
  children: ReactNode;
  /** `start` keeps content at the top for multi-line rows. */
  align?: 'center' | 'start';
  className?: string;
}

/** A full-width row under a hairline, for lists of items or a setting with its control. */
export function SettingsRow({ children, align = 'center', className }: SettingsRowProps) {
  return (
    <div className={clsx(styles.row, align === 'start' && styles.alignStart, className)}>{children}</div>
  );
}

interface SettingsMediaRowProps {
  /** Leading icon or logo. */
  media: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Status and figures: between the text and the control on wide screens, under the text on phones. */
  facts: ReactNode;
  control: ReactNode;
}

/** A list row for one item with a picture, a few facts and a control, such as a payment method. */
export function SettingsMediaRow({ media, title, description, facts, control }: SettingsMediaRowProps) {
  return (
    <div className={clsx(styles.row, styles.mediaRow)}>
      {media}
      <SettingText title={title} description={description} />
      <div className={styles.mediaFacts}>{facts}</div>
      {control}
    </div>
  );
}

/** Name and explanation of a setting in a row. */
export function SettingText({
  title,
  description,
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  id?: string;
}) {
  return (
    <span className={styles.text}>
      <span id={id} className={styles.textTitle}>
        {title}
      </span>
      {description && <span className={styles.textDescription}>{description}</span>}
    </span>
  );
}
