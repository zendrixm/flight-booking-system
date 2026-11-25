import { useState, type PointerEvent } from 'react';

import { formatPeso } from '@/lib/format';
import type { PriceAlert } from '@/types/priceAlert';

import { CHART_HEIGHT, chartGeometry, historyPointLabel } from '../../lib/priceAlerts';
import styles from './PriceHistoryChart.module.css';

interface PriceHistoryChartProps {
  alert: PriceAlert;
}

const percentOfHeight = (y: number) => `${(y / CHART_HEIGHT) * 100}%`;

/** 30-day sparkline of the lowest fare, with the target as a dashed Brass line and a hover read-out. */
export function PriceHistoryChart({ alert }: PriceHistoryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const history = alert.priceHistory;
  const lastIndex = history.length - 1;
  const { path, x, y } = chartGeometry(history, alert.targetPrice);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setHoverIndex(Math.round(ratio * lastIndex));
  };

  const description = `Lowest fare over the last 30 days, from ${formatPeso(history[0])} to ${formatPeso(history[lastIndex])}${
    alert.targetPrice !== null ? `; target ${formatPeso(alert.targetPrice)}` : ''
  }`;

  const dot = (index: number, isLarge: boolean) => (
    <span
      aria-hidden="true"
      className={isLarge ? styles.dotLarge : styles.dot}
      style={{ left: `${x(index)}%`, top: percentOfHeight(y(history[index])) }}
    />
  );

  return (
    <div className={styles.wrapper}>
      <div
        role="img"
        aria-label={description}
        className={styles.plot}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {alert.targetPrice !== null && (
          <span
            aria-hidden="true"
            className={styles.target}
            style={{ top: percentOfHeight(y(alert.targetPrice)) }}
          />
        )}
        <svg
          viewBox={`0 0 100 ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className={styles.svg}
          aria-hidden="true"
        >
          <path d={path} className={styles.line} vectorEffect="non-scaling-stroke" />
        </svg>
        {dot(lastIndex, false)}
        {hoverIndex !== null && (
          <>
            <span aria-hidden="true" className={styles.crosshair} style={{ left: `${x(hoverIndex)}%` }} />
            {dot(hoverIndex, true)}
            <span
              aria-hidden="true"
              className={styles.tooltip}
              data-edge={hoverIndex === 0 ? 'start' : hoverIndex === lastIndex ? 'end' : undefined}
              style={{ left: `${x(hoverIndex)}%` }}
            >
              <span className={styles.tooltipPrice}>{formatPeso(history[hoverIndex])}</span>{' '}
              <span className={styles.tooltipDate}>{historyPointLabel(alert, hoverIndex)}</span>
            </span>
          </>
        )}
      </div>
      <span className={styles.axis}>
        <span>{historyPointLabel(alert, 0)}</span>
        <span>{alert.isPaused ? historyPointLabel(alert, lastIndex) : 'Today'}</span>
      </span>
    </div>
  );
}
