import clsx from 'clsx';
import type { CSSProperties } from 'react';

import { Table } from '@/components/ui';

import { ELEVATIONS, LAYOUT_RHYTHM, PRINCIPLES, RADII, SPACING_SCALE } from '../data/foundations';
import { DsPanel, DsSection } from './DsSection';
import styles from './LayoutTokensSection.module.css';

const ELEVATION_CLASSES = [styles.level0, styles.level1, styles.level2, styles.level3];

export function LayoutTokensSection() {
  return (
    <DsSection eyebrow="04 · Space, shape, depth" title="Layout tokens">
      <div className={styles.threeUp}>
        <DsPanel title="Spacing · 4-point grid">
          <ul className={styles.spacing}>
            {SPACING_SCALE.map((space) => (
              <li key={space} className={styles.space}>
                <span className={styles.spaceValue}>{space}</span>
                <span
                  className={styles.spaceBar}
                  style={{ '--space-size': `${space * 2}px` } as CSSProperties}
                />
              </li>
            ))}
          </ul>
        </DsPanel>

        <DsPanel title="Radius">
          <ul className={styles.radii}>
            {RADII.map((radius) => (
              <li key={radius.value} className={styles.radius}>
                <span
                  className={styles.radiusBox}
                  style={{ '--radius-size': `${Math.min(radius.preview, 24)}px` } as CSSProperties}
                />
                <span className={styles.radiusValue}>{radius.value}</span>
                <span className={styles.radiusUse}>{radius.use}</span>
              </li>
            ))}
          </ul>
        </DsPanel>

        <DsPanel title="Elevation · Midnight shadows">
          <ul className={styles.elevations}>
            {ELEVATIONS.map((elevation) => (
              <li
                key={elevation.level}
                className={clsx(styles.elevation, ELEVATION_CLASSES[elevation.level])}
              >
                <strong>{elevation.name}</strong>
                <span>{elevation.use}</span>
              </li>
            ))}
          </ul>
        </DsPanel>
      </div>

      <div className={styles.tableCard}>
        <Table minWidth={720}>
          <caption className={styles.caption}>Layout rhythm · one value per job</caption>
          <thead>
            <tr>
              <th scope="col">Spacing</th>
              <th scope="col">Customer site</th>
              <th scope="col">Console</th>
            </tr>
          </thead>
          <tbody>
            {LAYOUT_RHYTHM.map((row) => (
              <tr key={row.spacing}>
                <th scope="row" className={styles.rowHeading}>
                  {row.spacing}
                </th>
                <td>{row.site}</td>
                <td>{row.console}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <ul className={styles.principles}>
        {PRINCIPLES.map((principle) => (
          <li key={principle.title} className={styles.principle}>
            <h3 className={styles.principleTitle}>{principle.title}</h3>
            <p className={styles.principleBody}>{principle.body}</p>
          </li>
        ))}
      </ul>
    </DsSection>
  );
}
