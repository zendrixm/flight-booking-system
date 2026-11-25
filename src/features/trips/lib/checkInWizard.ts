/**
 * Online check-in as a small state machine: four steps, each with one condition to move on.
 * Pure so the rules can be unit tested without rendering the page.
 */

export const CHECK_IN_STEPS = [
  { id: 'travelers', label: 'Travelers' },
  { id: 'documents', label: 'Documents' },
  { id: 'restrictedItems', label: 'Restricted items' },
  { id: 'seat', label: 'Seat' },
] as const;

export type CheckInStepId = (typeof CHECK_IN_STEPS)[number]['id'];

/** `none`: not carrying restricted items. `carrying`: blocks online check-in. */
export type Declaration = 'none' | 'carrying';

export interface CheckInDraft {
  stepIndex: number;
  isTravelerIncluded: boolean;
  /** Set once the traveler checkbox is used, so the error only shows after a deliberate untick. */
  hasToggledTraveler: boolean;
  areDocumentsConfirmed: boolean;
  declaration: Declaration | null;
  seat: string;
}

export type CheckInAction =
  | { type: 'goTo'; stepIndex: number }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'toggleTraveler' }
  | { type: 'toggleDocuments' }
  | { type: 'declare'; declaration: Declaration }
  | { type: 'pickSeat'; seat: string };

export const LAST_STEP_INDEX = CHECK_IN_STEPS.length - 1;

export function initialCheckInDraft(seat: string): CheckInDraft {
  return {
    stepIndex: 0,
    isTravelerIncluded: true,
    hasToggledTraveler: false,
    areDocumentsConfirmed: false,
    declaration: null,
    seat,
  };
}

export function currentStepId(draft: CheckInDraft): CheckInStepId {
  return CHECK_IN_STEPS[draft.stepIndex].id;
}

export function canContinue(draft: CheckInDraft): boolean {
  switch (currentStepId(draft)) {
    case 'travelers':
      return draft.isTravelerIncluded;
    case 'documents':
      return draft.areDocumentsConfirmed;
    case 'restrictedItems':
      return draft.declaration === 'none';
    case 'seat':
      return true;
  }
}

export function checkInReducer(draft: CheckInDraft, action: CheckInAction): CheckInDraft {
  switch (action.type) {
    case 'goTo':
      // Only steps already passed can be revisited from the progress bar.
      return action.stepIndex < draft.stepIndex ? { ...draft, stepIndex: action.stepIndex } : draft;
    case 'next':
      return canContinue(draft) && draft.stepIndex < LAST_STEP_INDEX
        ? { ...draft, stepIndex: draft.stepIndex + 1 }
        : draft;
    case 'back':
      return { ...draft, stepIndex: Math.max(0, draft.stepIndex - 1) };
    case 'toggleTraveler':
      return { ...draft, isTravelerIncluded: !draft.isTravelerIncluded, hasToggledTraveler: true };
    case 'toggleDocuments':
      return { ...draft, areDocumentsConfirmed: !draft.areDocumentsConfirmed };
    case 'declare':
      return { ...draft, declaration: action.declaration };
    case 'pickSeat':
      return { ...draft, seat: action.seat };
  }
}

export interface StepHint {
  text: string;
  isProblem: boolean;
}

/** The line under the main button: what comes next, or why it's disabled. */
export function stepHint(draft: CheckInDraft): StepHint {
  switch (currentStepId(draft)) {
    case 'travelers':
      return draft.isTravelerIncluded
        ? { text: 'Next: confirm travel documents', isProblem: false }
        : { text: 'Select a traveler to continue.', isProblem: draft.hasToggledTraveler };
    case 'documents':
      return {
        text: draft.areDocumentsConfirmed
          ? 'Next: restricted items'
          : 'Confirm the passport details to continue.',
        isProblem: false,
      };
    case 'restrictedItems':
      if (draft.declaration === 'carrying') {
        return { text: 'Online check-in isn’t available with restricted items.', isProblem: true };
      }
      return {
        text: draft.declaration === 'none' ? 'Next: check your seat' : 'Answer the declaration to continue.',
        isProblem: false,
      };
    case 'seat':
      return { text: 'Your boarding pass is issued straight away.', isProblem: false };
  }
}
