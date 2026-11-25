/** Seat map for the Airbus A321neo flown on the demo route: rows 10–30, seats A–F, aisle between C and D. */

export type SeatZone = 'front' | 'legroom' | 'standard';
export type SeatPosition = 'Window' | 'Middle' | 'Aisle';
export type FlightSegment = 'outbound' | 'inbound';

export const SEAT_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type SeatColumn = (typeof SEAT_COLUMNS)[number];

export const FIRST_ROW = 10;
export const LAST_ROW = 30;
/** Rows 14 and 15 are exit rows with extra legroom. */
export const EXIT_ROWS = [14, 15] as const;

export const ZONE_PRICES: Record<SeatZone, number> = { front: 450, legroom: 1150, standard: 0 };

export interface Seat {
  code: string;
  row: number;
  column: SeatColumn;
  zone: SeatZone;
  position: SeatPosition;
  price: number;
  isOccupied: boolean;
}

export interface SeatRow {
  number: number;
  isExitRow: boolean;
  seats: Seat[];
}

export function zoneOfRow(row: number): SeatZone {
  if (row <= 13) return 'front';
  if (row <= 15) return 'legroom';
  return 'standard';
}

export function positionOfColumn(column: string): SeatPosition {
  if (column === 'A' || column === 'F') return 'Window';
  if (column === 'C' || column === 'D') return 'Aisle';
  return 'Middle';
}

export function parseSeatCode(code: string): { row: number; column: string } {
  return { row: Number.parseInt(code, 10), column: code.slice(-1) };
}

export function seatPrice(code: string): number {
  return ZONE_PRICES[zoneOfRow(parseSeatCode(code).row)];
}

/** Deterministic pseudo-random occupancy so the same flight always shows the same map. */
function isSeatTaken(row: number, column: string, segment: FlightSegment): boolean {
  const seed = segment === 'outbound' ? 1.7 : 4.1;
  const noise = Math.sin(row * 12.9898 + column.charCodeAt(0) * 78.233 + seed) * 43758.5453;
  const fraction = noise - Math.floor(noise);
  return fraction < (row <= 15 ? 0.3 : 0.45);
}

/** Builds the map; seats in `reserved` (the travelers' own picks) are never shown as occupied. */
export function buildSeatMap(segment: FlightSegment, reserved: readonly string[] = []): SeatRow[] {
  const rows: SeatRow[] = [];
  for (let row = FIRST_ROW; row <= LAST_ROW; row += 1) {
    const zone = zoneOfRow(row);
    rows.push({
      number: row,
      isExitRow: (EXIT_ROWS as readonly number[]).includes(row),
      seats: SEAT_COLUMNS.map((column) => {
        const code = `${row}${column}`;
        return {
          code,
          row,
          column,
          zone,
          position: positionOfColumn(column),
          price: ZONE_PRICES[zone],
          isOccupied: !reserved.includes(code) && isSeatTaken(row, column, segment),
        };
      }),
    });
  }
  return rows;
}

export const SEAT_ZONE_FEATURES: Record<SeatZone, readonly string[]> = {
  front: ['Front cabin, off first', 'Full recline'],
  legroom: ['+12 cm legroom', 'Exit row, 15+ only'],
  standard: ['Standard pitch', 'Full recline'],
};

export const EXIT_ROW_RULES = [
  'Be 15 or older',
  'Be able and willing to help open the exit in an emergency',
  'Not be travelling with an infant or need help moving around the cabin',
  'Understand instructions from the crew in English',
  'Keep all bags in the overhead bin for take-off and landing',
] as const;
