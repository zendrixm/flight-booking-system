import { useMemo } from 'react';

import styles from './Barcode.module.css';

const SIZE = 21;
const FINDER_ORIGINS = [
  [0, 0],
  [0, SIZE - 7],
  [SIZE - 7, 0],
] as const;

/** On/off for the 7×7 finder squares in three corners, or null outside them. */
function finderCell(row: number, column: number): boolean | null {
  for (const [top, left] of FINDER_ORIGINS) {
    const y = row - top;
    const x = column - left;
    if (y >= 0 && y < 7 && x >= 0 && x < 7) {
      return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4);
    }
  }
  return null;
}

function isNearFinder(row: number, column: number): boolean {
  return (row < 8 && column < 8) || (row < 8 && column > SIZE - 9) || (row > SIZE - 9 && column < 8);
}

/** Deterministic noise in [0, 1) so the same seed always draws the same code. */
function noise(row: number, column: number, seed: number): number {
  const value = Math.sin(row * 91.7 + column * 47.3 + seed * 13.1) * 9301.17;
  return value - Math.floor(value);
}

function seedOf(text: string): number {
  return [...text].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 97;
}

interface BarcodeProps {
  /** Data the code stands for; also seeds the pattern. */
  value: string;
  label?: string;
  /** Cell size in pixels. */
  cellSize?: number;
}

/**
 * A QR-style matrix drawn as one SVG path. Illustrative only — a real app renders the airline's
 * BCBP barcode with a barcode library.
 */
export function Barcode({ value, label = 'Boarding pass barcode', cellSize = 5 }: BarcodeProps) {
  const path = useMemo(() => {
    const seed = seedOf(value);
    let d = '';
    for (let row = 0; row < SIZE; row += 1) {
      for (let column = 0; column < SIZE; column += 1) {
        const finder = finderCell(row, column);
        const isOn = finder ?? (!isNearFinder(row, column) && noise(row, column, seed) > 0.52);
        if (isOn) d += `M${column} ${row}h1v1h-1z`;
      }
    }
    return d;
  }, [value]);

  return (
    <span className={styles.frame}>
      <svg
        role="img"
        aria-label={label}
        width={SIZE * cellSize}
        height={SIZE * cellSize}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        shapeRendering="crispEdges"
      >
        <path d={path} fill="var(--color-midnight)" />
      </svg>
    </span>
  );
}
