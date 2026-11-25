import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { CountBadge } from '../Badge';
import styles from './Tabs.module.css';

export interface TabItem<Id extends string> {
  id: Id;
  label: string;
  count?: number;
  /** Shows a Brass dot after the label; the text is read to screen readers, e.g. "has unsaved changes". */
  marker?: string;
}

interface TabsProps<Id extends string> {
  /** Accessible name of the tab list. */
  label: string;
  items: ReadonlyArray<TabItem<Id>>;
  value: Id;
  onChange: (id: Id) => void;
  /** The panel for the selected tab. */
  children: ReactNode;
  /** Counts above this show as "99+"; pass `Infinity` to show totals in full. */
  countMax?: number;
  className?: string;
}

/** Underlined tabs with automatic activation; Left/Right/Home/End move between tabs. */
export function Tabs<Id extends string>({
  label,
  items,
  value,
  onChange,
  children,
  countMax,
  className,
}: TabsProps<Id>) {
  const baseId = useId();
  const tabRefs = useRef(new Map<Id, HTMLButtonElement>());
  const tabId = (id: Id) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  function focusTab(index: number) {
    const item = items[(index + items.length) % items.length];
    onChange(item.id);
    tabRefs.current.get(item.id)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = items.findIndex((item) => item.id === value);
    const moves: Record<string, number> = {
      ArrowRight: currentIndex + 1,
      ArrowLeft: currentIndex - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusTab(moves[event.key]);
    }
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className={styles.tabList} onKeyDown={handleKeyDown}>
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              ref={(element) => {
                if (element) tabRefs.current.set(item.id, element);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => onChange(item.id)}
            >
              {item.label}
              {item.count !== undefined && <CountBadge count={item.count} max={countMax} />}
              {item.marker && <span role="img" aria-label={item.marker} className={styles.marker} />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(value)} tabIndex={0} className={styles.panel}>
        {children}
      </div>
    </div>
  );
}
