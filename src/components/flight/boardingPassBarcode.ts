import type { BoardingPass } from '@/types/boardingPass';

/** What a pass's barcode encodes, so every rendering of the same pass draws the same code. */
export function boardingPassBarcode(pass: Pick<BoardingPass, 'reference' | 'flightNumber' | 'seat'>): string {
  return `${pass.reference}${pass.flightNumber}${pass.seat}`;
}
