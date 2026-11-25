import clsx from 'clsx';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router';

import { Icon, type IconName } from '@/components/icons';

import { Popover, type PopoverTriggerProps } from '../Popover';
import styles from './Menu.module.css';

export type MenuEntry =
  | {
      kind?: 'item';
      id: string;
      label: ReactNode;
      description?: ReactNode;
      icon?: IconName;
      /** Large icon tile instead of a plain icon (used in "Add to calendar"). */
      iconTile?: boolean;
      /** Navigate on select. */
      to?: string;
      onSelect?: () => void;
      trailing?: ReactNode;
      tone?: 'default' | 'danger';
      /** Makes the item one choice of a set (`menuitemradio`), e.g. a workspace switcher. */
      checked?: boolean;
    }
  | { kind: 'separator'; id: string };

interface MenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: (props: PopoverTriggerProps) => ReactNode;
  items: ReadonlyArray<MenuEntry>;
  /** Accessible name of the menu. */
  label: string;
  header?: ReactNode;
  /** Content above the items, e.g. the signed-in person's name. */
  intro?: ReactNode;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  width?: number;
  /** Stretch the trigger's anchor to its container, for full-width triggers. */
  block?: boolean;
}

/** A menu of actions or links. Arrow keys move between items; Escape closes and returns focus. */
export function Menu({
  open,
  onOpenChange,
  trigger,
  items,
  label,
  header,
  intro,
  align,
  side,
  width = 280,
  block,
}: MenuProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const elements = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? elements.length - 1
          : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + elements.length) % elements.length;
    elements[nextIndex]?.focus();
  }

  const close = () => onOpenChange(false);

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      align={align}
      side={side}
      width={width}
      block={block}
      role="menu"
    >
      <div
        ref={listRef}
        role="menu"
        tabIndex={-1}
        aria-label={label}
        className={styles.menu}
        onKeyDown={moveFocus}
      >
        {intro}
        {header && <span className={styles.header}>{header}</span>}
        {items.map((entry) => {
          if (entry.kind === 'separator') {
            return <span key={entry.id} role="separator" className={styles.separator} />;
          }
          const content = (
            <>
              {entry.icon && (
                <span className={clsx(styles.itemIcon, entry.iconTile && styles.iconTile)}>
                  <Icon name={entry.icon} size={18} />
                </span>
              )}
              <span className={styles.itemText}>
                <span>{entry.label}</span>
                {entry.description && <span className={styles.itemDescription}>{entry.description}</span>}
              </span>
              {entry.trailing}
              {entry.checked && <Icon name="check" size={18} strokeWidth={2} className={styles.checkMark} />}
            </>
          );
          const isRadio = entry.checked !== undefined;
          const itemRole = isRadio ? 'menuitemradio' : 'menuitem';
          const className = clsx(
            styles.item,
            entry.tone === 'danger' && styles.danger,
            entry.checked && styles.checked,
          );
          return entry.to ? (
            <Link
              key={entry.id}
              role={itemRole}
              aria-checked={isRadio ? entry.checked : undefined}
              to={entry.to}
              className={className}
              onClick={close}
            >
              {content}
            </Link>
          ) : (
            <button
              key={entry.id}
              type="button"
              role={itemRole}
              aria-checked={isRadio ? entry.checked : undefined}
              className={className}
              onClick={() => {
                entry.onSelect?.();
                close();
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
