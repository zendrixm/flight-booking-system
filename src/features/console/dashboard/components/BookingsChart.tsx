import clsx from 'clsx';
import { useState, type CSSProperties } from 'react';

import { SegmentedControl } from '@/components/ui';
import type { DashboardOverview } from '@/types/console/dashboard';

import { ConsolePanel } from '../../shared/components/ConsolePanel';
import { bookingsLabel, formatGrossValue } from '../lib/dashboardFormat';
import styles from './BookingsChart.module.css';

type ChartView = 'chart' | 'table';

const VIEW_OPTIONS = [
  { value: 'chart' as const, label: 'Chart' },
  { value: 'table' as const, label: 'Table' },
];

/** Bars stay at least this far apart; 30 bars sit closer together. */
const DENSE_BAR_COUNT = 20;

export function BookingsChart({ overview }: { overview: DashboardOverview }) {
  const [view, setView] = useState<ChartView>('chart');

  return (
    <ConsolePanel
      title={overview.chartTitle}
      description={overview.chartSubtitle}
      aside={
        <SegmentedControl<ChartView>
          label="View"
          appearance="soft"
          density="compact"
          value={view}
          onChange={setView}
          options={VIEW_OPTIONS}
        />
      }
      className={styles.panel}
    >
      {view === 'chart' ? <BarChart overview={overview} /> : <VolumeTable overview={overview} />}
    </ConsolePanel>
  );
}

function BarChart({ overview }: { overview: DashboardOverview }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { points, axisTicks } = overview;
  const axisMax = axisTicks[0];
  const isDense = points.length > DENSE_BAR_COUNT;
  const counts = points.map((point) => point.bookings);
  const hovered = hoveredIndex === null ? null : points[hoveredIndex];
  const tickPosition = (index: number) => `${(index / (axisTicks.length - 1)) * 100}%`;

  return (
    <div className={styles.chart}>
      <div className={styles.yAxis} aria-hidden="true">
        {axisTicks.map((tick, index) => (
          <span key={tick} className={styles.yTick} style={{ top: tickPosition(index) }}>
            {tick.toLocaleString('en-US')}
          </span>
        ))}
      </div>
      <div className={styles.plotArea}>
        <div
          role="img"
          aria-label={`Bar chart of bookings per ${overview.interval}, ${overview.periodLabel}, ranging from ${Math.min(...counts)} to ${Math.max(...counts)}. Switch to Table for exact values.`}
          className={clsx(styles.plot, isDense && styles.dense)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {axisTicks.slice(0, -1).map((tick, index) => (
            <span
              key={tick}
              className={styles.gridLine}
              style={{ top: tickPosition(index) }}
              aria-hidden="true"
            />
          ))}
          {points.map((point, index) => (
            <div key={point.label} className={styles.barSlot} onMouseEnter={() => setHoveredIndex(index)}>
              <span
                className={clsx(
                  styles.bar,
                  hoveredIndex === index && styles.barActive,
                  hoveredIndex !== null && hoveredIndex !== index && styles.barMuted,
                )}
                style={{ height: `${(point.bookings / axisMax) * 100}%` }}
              />
            </div>
          ))}
          {hovered && hoveredIndex !== null && (
            <ChartTooltip
              left={((hoveredIndex + 0.5) / points.length) * 100}
              bottom={(hovered.bookings / axisMax) * 100}
              title={hovered.longLabel}
              value={bookingsLabel(hovered.bookings)}
              detail={`${formatGrossValue(hovered.grossValue)} GBV`}
            />
          )}
        </div>
        <div className={clsx(styles.xAxis, isDense && styles.dense)} aria-hidden="true">
          {points.map((point, index) => (
            <span key={point.label} className={styles.xTick}>
              {index % overview.labelEvery === 0 ? point.label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChartTooltipProps {
  /** Percent from the left of the plot. */
  left: number;
  /** Percent from the bottom of the plot (the top of the bar). */
  bottom: number;
  title: string;
  value: string;
  detail: string;
}

function ChartTooltip({ left, bottom, title, value, detail }: ChartTooltipProps) {
  // Keep the tooltip inside the plot near either edge.
  const shift = left > 70 ? '-100%' : left < 20 ? '0' : '-50%';
  const position = {
    left: `${left}%`,
    bottom: `calc(${bottom}% + 10px)`,
    '--tooltip-shift': shift,
  } as CSSProperties;
  return (
    <div className={styles.tooltip} style={position} aria-hidden="true">
      <span className={styles.tooltipTitle}>{title}</span>
      <span className={styles.tooltipValue}>{value}</span>
      <span className={styles.tooltipDetail}>{detail}</span>
    </div>
  );
}

function VolumeTable({ overview }: { overview: DashboardOverview }) {
  return (
    <div className={styles.tableScroller}>
      <table className={styles.table}>
        <caption className="visually-hidden">
          Bookings per {overview.interval}, {overview.periodLabel}
        </caption>
        <thead>
          <tr>
            <th scope="col">{overview.intervalColumn}</th>
            <th scope="col" className={styles.number}>
              Bookings
            </th>
            <th scope="col" className={styles.number}>
              GBV
            </th>
          </tr>
        </thead>
        <tbody>
          {overview.points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td className={styles.number}>{point.bookings.toLocaleString('en-US')}</td>
              <td className={styles.number}>{formatGrossValue(point.grossValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
