import clsx from 'clsx';
import type { CSSProperties } from 'react';

import { Table } from '@/components/ui';

import { OPACITY_LADDER, OPACITY_STEPS, PALETTE, type OpacityExample } from '../data/foundations';
import { DsSection } from './DsSection';
import styles from './PaletteSection.module.css';

/** A colour token at an opacity, e.g. `rgb(var(--rgb-brass) / 0.4)`. */
function tint(rgbToken: string, percent: number): string {
  return `rgb(var(${rgbToken}) / ${percent / 100})`;
}

const EXAMPLE_CLASSES: Record<OpacityExample, string> = {
  primary: styles.examplePrimary,
  secondary: styles.exampleSecondary,
  caption: styles.exampleCaption,
  disabled: styles.exampleDisabled,
  outlined: styles.exampleOutlined,
  chip: styles.exampleChip,
  readOnly: styles.exampleReadOnly,
};

export function PaletteSection() {
  return (
    <DsSection eyebrow="01 · Color" title="The palette">
      <ul className={styles.palette}>
        {PALETTE.map((color) => (
          <li key={color.name} className={styles.color}>
            <div
              className={clsx(styles.swatch, color.onColor === 'midnight' ? styles.onLight : styles.onDark)}
              style={{ background: tint(color.rgbToken, 100) }}
            >
              <span aria-hidden="true">Aa</span>
            </div>
            <div className={styles.details}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{color.name}</span>
                <code className={styles.hex}>{color.hex}</code>
              </div>
              <span className={styles.role}>{color.role}</span>
              <span className={styles.contrast}>{color.contrast}</span>
            </div>
            <ul className={styles.ladder} aria-label={`${color.name} opacity steps`}>
              {OPACITY_LADDER.map((percent) => (
                <li key={percent} className={styles.step}>
                  <span
                    className={styles.chip}
                    style={{ '--chip-color': tint(color.rgbToken, percent) } as CSSProperties}
                  />
                  <span>{percent}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className={styles.tableCard}>
        <Table minWidth={640}>
          <thead>
            <tr>
              <th scope="col">Opacity step</th>
              <th scope="col">Used for</th>
              <th scope="col">Example</th>
            </tr>
          </thead>
          <tbody>
            {OPACITY_STEPS.map((step) => (
              <tr key={step.step}>
                <td className={styles.stepValue}>{step.step}</td>
                <td>{step.use}</td>
                <td>
                  <span className={EXAMPLE_CLASSES[step.example]}>{step.sample}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </DsSection>
  );
}
