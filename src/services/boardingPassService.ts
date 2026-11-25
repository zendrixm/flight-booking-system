import { BOARDING_PASSES } from '@/mocks/boardingPasses';
import type { BoardingPass } from '@/types/boardingPass';

import { ApiError, mockRequest } from './mockApi';

const passes = new Map(BOARDING_PASSES.map((pass) => [pass.reference, structuredClone(pass)]));

function update(reference: string, patch: Partial<BoardingPass>): Promise<BoardingPass> {
  return mockRequest(() => {
    const pass = passes.get(reference);
    if (!pass) throw new ApiError('not_found', 'Check-in isn’t open for this booking.');
    const next = { ...pass, ...patch };
    passes.set(reference, next);
    return next;
  });
}

/** The boarding pass for a booking whose check-in is open; rejects with `not_found` otherwise. */
export function getBoardingPass(reference: string): Promise<BoardingPass> {
  return update(reference, {});
}

export function checkIn(reference: string, seat: string): Promise<BoardingPass> {
  return update(reference, { isCheckedIn: true, seat, checkedInLabel: 'just now' });
}

export function undoCheckIn(reference: string): Promise<BoardingPass> {
  return update(reference, { isCheckedIn: false, isInWallet: false });
}

export function changeBoardingSeat(reference: string, seat: string): Promise<BoardingPass> {
  return update(reference, { seat });
}

export function addToWallet(reference: string): Promise<BoardingPass> {
  return update(reference, { isInWallet: true });
}

/** Prepares the PDF and resolves with its file name, e.g. `MR518-REYES.pdf`. */
export function downloadBoardingPass(reference: string): Promise<{ fileName: string }> {
  return mockRequest(() => {
    const pass = passes.get(reference);
    if (!pass?.isCheckedIn) throw new ApiError('not_checked_in', 'Check in first to get your boarding pass.');
    const surname = pass.passenger.printedName.split(' / ')[0];
    return { fileName: `${pass.flightNumber.replace(/\s/g, '')}-${surname}.pdf` };
  });
}
