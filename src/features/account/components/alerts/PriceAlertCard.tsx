import clsx from 'clsx';
import { useState } from 'react';

import { Icon, type IconName } from '@/components/icons';
import { Button, LinkButton, TextField } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { PriceAlert } from '@/types/priceAlert';

import {
  ALERT_STATUS_LABEL,
  alertStatus,
  cityOf,
  latestFare,
  parseTargetInput,
  targetLabel,
  weeklyChange,
  weeklyChangeLabel,
  type AlertStatus,
} from '../../lib/priceAlerts';
import styles from './PriceAlertCard.module.css';
import { PriceHistoryChart } from './PriceHistoryChart';

const STATUS_ICON: Record<AlertStatus, IconName> = { paused: 'pause', belowTarget: 'check', watching: 'eye' };

interface PriceAlertCardProps {
  alert: PriceAlert;
  resultsUrl: string;
  isEditing: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveTarget: (target: number | null) => void;
  onTogglePause: () => void;
  onDelete: () => void;
}

export function PriceAlertCard({
  alert,
  resultsUrl,
  isEditing,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSaveTarget,
  onTogglePause,
  onDelete,
}: PriceAlertCardProps) {
  const status = alertStatus(alert);
  const fare = latestFare(alert);
  const change = weeklyChange(alert.priceHistory);
  const route = `${cityOf(alert.from)} → ${cityOf(alert.to)}`;

  return (
    <article
      aria-label={`${cityOf(alert.from)} to ${cityOf(alert.to)} price alert, ${ALERT_STATUS_LABEL[status]}`}
      className={clsx(styles.card, status === 'belowTarget' && styles.hit)}
    >
      <div className={styles.body}>
        <div className={styles.route}>
          <span className={clsx(styles.status, styles[status])}>
            <Icon name={STATUS_ICON[status]} size={14} strokeWidth={2} />
            {ALERT_STATUS_LABEL[status]}
          </span>
          <span className={clsx(styles.routeNames, alert.isPaused && styles.dimmed)}>
            <span className={styles.cities}>{route}</span>
            <span className={styles.codes}>
              {alert.from} ⇄ {alert.to}
            </span>
          </span>
          <span className={clsx(styles.trip, alert.isPaused && styles.dimmed)}>
            <span>{alert.datesLabel}</span>
            <span>{alert.travelersLabel}</span>
          </span>
        </div>

        <div className={clsx(styles.chart, alert.isPaused && styles.dimmed)}>
          <span className={styles.chartHeader}>
            <span>Lowest fare · 30 days</span>
            {alert.targetPrice !== null && fare !== null && (
              <span className={styles.key}>
                <span aria-hidden="true" className={styles.keySwatch} />
                Target
              </span>
            )}
          </span>
          {fare !== null ? (
            <PriceHistoryChart alert={alert} />
          ) : (
            <div className={styles.chartEmpty}>
              <Icon name="clock" size={16} strokeWidth={1.8} />
              The chart fills in after our first check, within 6 hours.
            </div>
          )}
        </div>

        <div className={clsx(styles.price, alert.isPaused && styles.dimmed)}>
          <span className={styles.label}>{alert.isPaused ? 'Last seen' : 'Lowest now'}</span>
          <span className={styles.amount}>{fare !== null ? formatPeso(fare) : 'Checking…'}</span>
          <span
            className={clsx(
              styles.change,
              fare !== null && change < 0 && styles.down,
              fare !== null && change > 0 && styles.up,
            )}
          >
            {weeklyChangeLabel(alert)}
          </span>
          {isEditing ? (
            <TargetEditor
              initialTarget={alert.targetPrice}
              isSaving={isSaving}
              onCancel={onCancelEdit}
              onSave={onSaveTarget}
            />
          ) : (
            <span className={styles.target}>{targetLabel(alert)}</span>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.note}>{alert.statusNote}</span>
        <span className={styles.actions}>
          <Button
            variant="ghost"
            size="small"
            iconStart={alert.isPaused ? 'play' : 'pause'}
            onClick={onTogglePause}
          >
            {alert.isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="ghost"
            size="small"
            iconStart="pencil"
            disabled={alert.isPaused || isEditing}
            onClick={onStartEdit}
          >
            Edit target
          </Button>
          <Button
            variant="destructiveGhost"
            size="small"
            iconStart="trash"
            aria-label={`Delete ${cityOf(alert.to)} alert`}
            aria-haspopup="dialog"
            onClick={onDelete}
          >
            Delete
          </Button>
          {alert.isPaused ? (
            <Button variant="quiet" size="small" disabled>
              View flights
            </Button>
          ) : (
            <LinkButton
              to={resultsUrl}
              variant={status === 'belowTarget' ? 'primary' : 'secondary'}
              size="small"
            >
              View flights
            </LinkButton>
          )}
        </span>
      </div>
    </article>
  );
}

interface TargetEditorProps {
  initialTarget: number | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (target: number | null) => void;
}

function TargetEditor({ initialTarget, isSaving, onCancel, onSave }: TargetEditorProps) {
  const [value, setValue] = useState(initialTarget === null ? '' : initialTarget.toLocaleString('en-US'));
  const parsed = parseTargetInput(value);
  const isInvalid = parsed === 'invalid';

  return (
    <form
      className={styles.editor}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!isInvalid) onSave(parsed);
      }}
    >
      <TextField
        label="Target price"
        prefix="₱"
        inputMode="numeric"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- the editor opens on the user's Edit click, so focus follows it
        autoFocus
        value={value}
        error={isInvalid ? 'Enter an amount in pesos, or clear it.' : undefined}
        helpText="Leave empty to hear about any drop."
        onChange={(event) => setValue(event.target.value)}
      />
      <span className={styles.editorActions}>
        <Button type="submit" variant="primary" size="small" disabled={isInvalid} loading={isSaving}>
          Save
        </Button>
        <Button variant="quiet" size="small" onClick={onCancel}>
          Cancel
        </Button>
      </span>
    </form>
  );
}
