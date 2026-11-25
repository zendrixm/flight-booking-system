import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, IconButton, Popover, SelectField } from '@/components/ui';
import type { BookingChannel, BookingFilters, CreatedRange } from '@/types/console/booking';

import {
  CHANNEL_OPTIONS,
  FILTER_GROUPS,
  filterChipLabel,
  filterValueOf,
  RANGE_OPTIONS,
  withFilter,
} from '../lib/bookingPresentation';
import styles from './BookingsToolbar.module.css';

interface BookingsToolbarProps {
  search: string;
  channel: BookingChannel | 'all';
  range: CreatedRange;
  rangeCounts: Record<CreatedRange, number> | undefined;
  filters: BookingFilters;
  onSearchChange: (search: string) => void;
  onChannelChange: (channel: BookingChannel | 'all') => void;
  onRangeChange: (range: CreatedRange) => void;
  onFiltersChange: (filters: BookingFilters) => void;
}

export function BookingsToolbar(props: BookingsToolbarProps) {
  const [openPopover, setOpenPopover] = useState<'range' | 'filter' | null>(null);
  const range = RANGE_OPTIONS.find((option) => option.id === props.range) ?? RANGE_OPTIONS[2];
  const activeFilters = FILTER_GROUPS.flatMap((group) => {
    const value = filterValueOf(props.filters, group.key);
    return value === undefined ? [] : [{ group, value, label: filterChipLabel(group, value) }];
  });

  return (
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <Icon name="search" size={16} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          aria-label="Search bookings"
          placeholder="Reference, name or email"
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
      </label>

      <SelectField
        label="Channel"
        labelHidden
        className={styles.channel}
        value={props.channel}
        options={CHANNEL_OPTIONS}
        onChange={(event) =>
          props.onChannelChange(
            CHANNEL_OPTIONS.find((option) => option.value === event.target.value)?.value ?? 'all',
          )
        }
      />

      <Popover
        open={openPopover === 'range'}
        onOpenChange={(open) => setOpenPopover(open ? 'range' : null)}
        label="Created date"
        width={300}
        trigger={(triggerProps) => (
          <Button
            {...triggerProps}
            variant="quiet"
            iconStart="calendar"
            iconEnd="chevronDown"
            aria-label={`Created date: ${range.label}, ${range.period}`}
          >
            {range.buttonLabel}
          </Button>
        )}
      >
        <div className={styles.popover}>
          <span className={styles.popoverTitle}>Created</span>
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === props.range}
              className={clsx(styles.rangeOption, option.id === props.range && styles.rangeOptionOn)}
              onClick={() => {
                props.onRangeChange(option.id);
                setOpenPopover(null);
              }}
            >
              <span className={styles.rangeText}>
                <span className={styles.rangeLabel}>{option.label}</span>
                <span className={styles.rangePeriod}>{option.period}</span>
              </span>
              <span className={styles.rangeCount}>
                {props.rangeCounts?.[option.id].toLocaleString('en-US') ?? '—'}
              </span>
            </button>
          ))}
          <span className={styles.popoverNote}>Bookings older than 30 days are in Reports.</span>
        </div>
      </Popover>

      <Popover
        open={openPopover === 'filter'}
        onOpenChange={(open) => setOpenPopover(open ? 'filter' : null)}
        label="Add filter"
        width={340}
        trigger={(triggerProps) => (
          <Button {...triggerProps} variant="quiet" iconStart="filter">
            Add filter
          </Button>
        )}
      >
        <div className={styles.popover}>
          {FILTER_GROUPS.map((group) => (
            <div key={group.key} role="group" aria-label={group.label} className={styles.filterGroup}>
              <span className={styles.popoverTitle}>{group.label}</span>
              <div className={styles.filterOptions}>
                {group.options.map((option) => {
                  const isOn = filterValueOf(props.filters, group.key) === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isOn}
                      className={clsx(styles.filterOption, isOn && styles.filterOptionOn)}
                      onClick={() => {
                        props.onFiltersChange(
                          withFilter(props.filters, group.key, isOn ? undefined : option.value),
                        );
                        setOpenPopover(null);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Popover>

      {activeFilters.map((filter) => (
        <span key={filter.group.key} className={styles.chip}>
          {filter.label}
          <IconButton
            icon="close"
            label={`Remove filter ${filter.label}`}
            size="small"
            iconSize={12}
            className={styles.chipRemove}
            onClick={() => props.onFiltersChange(withFilter(props.filters, filter.group.key, undefined))}
          />
        </span>
      ))}
      {activeFilters.length > 1 && (
        <button type="button" className={styles.clearFilters} onClick={() => props.onFiltersChange({})}>
          Clear filters
        </button>
      )}
    </div>
  );
}
