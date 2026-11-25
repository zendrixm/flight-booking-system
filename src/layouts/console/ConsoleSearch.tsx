import clsx from 'clsx';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, type IconName } from '@/components/icons';
import { Spinner, StatusChip } from '@/components/ui';
import { useMediaQuery, useOnClickOutside } from '@/hooks';
import { pluralize } from '@/lib/format';
import type { ConsoleSearchKind, ConsoleSearchResult } from '@/types/console/search';

import styles from './ConsoleSearch.module.css';
import { splitOnMatch, useConsoleSearch } from './useConsoleSearch';

const KIND_ICON: Record<ConsoleSearchKind, IconName> = {
  booking: 'ticket',
  customer: 'user',
  flight: 'plane',
};

export function consoleSearchResultUrl(result: ConsoleSearchResult): string {
  if (result.kind === 'booking') return paths.console.booking(result.id);
  if (result.kind === 'customer') return paths.console.customer(result.id);
  return paths.console.flight(result.id);
}

/** Search bookings, customers and flights from the app bar. ⌘K or Ctrl+K focuses it from anywhere. */
export function ConsoleSearch() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const isNarrow = useMediaQuery('(max-width: 520px)');

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { groups, isLoading } = useConsoleSearch(query);

  const results = groups.flatMap((group) => group.results);
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  const hasQuery = query.length > 0;
  const showPanel = isOpen && query.trim().length > 0;
  const active = Math.min(activeIndex, Math.max(0, results.length - 1));

  useOnClickOutside([rootRef], () => setIsOpen(false), isOpen);

  useEffect(() => {
    const focusOnShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusOnShortcut);
    return () => window.removeEventListener('keydown', focusOnShortcut);
  }, []);

  const close = () => {
    setIsOpen(false);
    setActiveIndex(0);
  };

  const openResult = (result: ConsoleSearchResult) => {
    close();
    setQuery('');
    navigate(consoleSearchResultUrl(result));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (showPanel) close();
      else if (query) setQuery('');
      else inputRef.current?.blur();
    } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && results.length) {
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((active + step + results.length) % results.length);
    } else if (event.key === 'Enter' && showPanel && results[active]) {
      event.preventDefault();
      openResult(results[active]);
    }
  };

  let resultIndex = 0;

  return (
    <div ref={rootRef} className={clsx(styles.search, showPanel && styles.open)}>
      <Icon name="search" size={16} className={styles.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search the console"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results.length ? optionId(active) : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={isNarrow ? 'Search' : 'Search PNR, ticket, email or flight'}
        className={clsx(styles.input, hasQuery && styles.hasQuery)}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {hasQuery ? (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear search"
          onClick={() => {
            setQuery('');
            close();
            inputRef.current?.focus();
          }}
        >
          <Icon name="close" size={14} strokeWidth={2} />
        </button>
      ) : (
        <kbd className={styles.shortcut} aria-hidden="true">
          ⌘K
        </kbd>
      )}

      {showPanel && (
        <div className={styles.panel}>
          <div id={listboxId} role="listbox" aria-label={`Search results for ${query.trim()}`}>
            {groups.map((group) => (
              <div key={group.kind} role="group" aria-label={group.label} className={styles.group}>
                <span className={styles.groupLabel} aria-hidden="true">
                  {group.label}
                  <span className={styles.groupCount}>
                    {group.total > group.results.length
                      ? `Top ${group.results.length} of ${group.total}`
                      : group.total}
                  </span>
                </span>
                {group.results.map((result) => {
                  const index = resultIndex++;
                  const title = splitOnMatch(result.title, query);
                  return (
                    <Link
                      key={result.id}
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === active}
                      tabIndex={-1}
                      to={consoleSearchResultUrl(result)}
                      className={clsx(styles.option, index === active && styles.optionActive)}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={close}
                    >
                      <span className={clsx(styles.tile, styles[result.kind])} aria-hidden="true">
                        <Icon name={KIND_ICON[result.kind]} size={16} />
                      </span>
                      <span className={styles.optionText}>
                        <span className={styles.optionTitle}>
                          {title.before}
                          {title.match && <mark className={styles.match}>{title.match}</mark>}
                          {title.after}
                        </span>
                        <span className={styles.optionMeta}>{result.meta}</span>
                      </span>
                      <StatusChip tone={result.status.tone} hideDot size="compact">
                        {result.status.label}
                      </StatusChip>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {results.length > 0 ? (
            <div className={styles.footer}>
              <span role="status">{pluralize(total, 'result')}</span>
              <span className={styles.keys} aria-hidden="true">
                <span>
                  <kbd>↑↓</kbd> move
                </span>
                <span>
                  <kbd>↵</kbd> open
                </span>
                <span>
                  <kbd>esc</kbd> close
                </span>
              </span>
            </div>
          ) : isLoading ? (
            <div role="status" className={styles.loading}>
              <Spinner size={18} />
              Searching…
            </div>
          ) : (
            <div role="status" className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <Icon name="searchX" size={20} />
              </span>
              <span className={styles.emptyTitle}>No results for “{query.trim()}”</span>
              <span className={styles.emptyText}>
                Try a booking reference like VL7Q2K, a traveler’s email, an e-ticket number or a flight such
                as PQ 117.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
