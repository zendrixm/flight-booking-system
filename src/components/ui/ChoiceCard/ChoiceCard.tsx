import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './ChoiceCard.module.css';

export interface ChoiceCardProps extends Omit<ComponentProps<'input'>, 'type' | 'title'> {
  /** Radio for one-of-many choices, checkbox for independent toggles. */
  type?: 'radio' | 'checkbox';
  title: ReactNode;
  description?: ReactNode;
  /** Detail such as a price: right-aligned in a row card, on its own line in a stacked card. */
  meta?: ReactNode;
  icon?: IconName;
  /** Custom leading visual, e.g. a provider monogram. Takes the place of `icon`. */
  leading?: ReactNode;
  /** `row` for list-like choices, `stacked` for tiles laid out in a grid. */
  layout?: 'row' | 'stacked';
  /** Where the radio or checkbox mark sits. */
  indicator?: 'start' | 'end' | 'none';
  /** Extra content inside the tile, e.g. a list of what an option covers. */
  children?: ReactNode;
}

/**
 * A selectable tile backed by a native radio or checkbox, so keyboard and screen reader behaviour
 * come for free. Selected: Brass border and 10% tint.
 */
export function ChoiceCard({
  type = 'radio',
  title,
  description,
  meta,
  icon,
  leading,
  layout = 'row',
  indicator = 'start',
  className,
  children,
  ...inputProps
}: ChoiceCardProps) {
  const mark = (
    <span aria-hidden="true" className={clsx(styles.indicator, type === 'checkbox' && styles.checkbox)} />
  );

  return (
    <label className={clsx(styles.card, styles[layout], className)}>
      <input type={type} className={styles.input} {...inputProps} />
      {indicator === 'start' && mark}
      {leading ??
        (icon && (
          <span className={styles.icon}>
            <Icon name={icon} />
          </span>
        ))}
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {layout === 'stacked' && indicator === 'end' && mark}
        </span>
        {description && <span className={styles.description}>{description}</span>}
        {layout === 'stacked' && meta && <span className={styles.stackedMeta}>{meta}</span>}
        {children}
      </span>
      {layout === 'row' && meta && <span className={styles.meta}>{meta}</span>}
      {layout === 'row' && indicator === 'end' && mark}
    </label>
  );
}
