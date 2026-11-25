import { BOOKING_HORIZON } from '@/config/demo';
import { findAirport } from '@/data/airports';
import { addDays, minDate, type IsoDate } from '@/lib/date';
import type { CabinClass, TripType } from '@/types/flight';

import {
  chainLegDates,
  MAX_EXTRA_LEGS,
  placeFromCode,
  placeFromQuery,
  travelerLimits,
  type SearchFormState,
  type TravelerKind,
} from './searchForm';

/** Which date the open calendar is choosing. */
export type CalendarTarget = { kind: 'depart' } | { kind: 'return' } | { kind: 'leg'; index: number };

export type SearchFormAction =
  | { type: 'setTripType'; tripType: TripType }
  | { type: 'typePlace'; field: 'from' | 'to'; query: string }
  | { type: 'choosePlace'; field: 'from' | 'to'; code: string }
  | { type: 'swapPlaces' }
  | { type: 'typeLegPlace'; index: number; field: 'from' | 'to'; query: string }
  | { type: 'pickDate'; target: CalendarTarget; date: IsoDate }
  | { type: 'changeTravelers'; kind: TravelerKind; delta: 1 | -1 }
  | { type: 'setCabin'; cabin: CabinClass }
  | { type: 'toggleFlexibleDates' }
  | { type: 'addLeg' }
  | { type: 'removeLeg'; index: number }
  | { type: 'trySearch' };

/** Destinations offered when adding another multi-city flight, in order of preference. */
const NEXT_LEG_DESTINATIONS = ['ICN', 'TPE', 'SIN', 'HKG', 'MNL'];

export function searchFormReducer(state: SearchFormState, action: SearchFormAction): SearchFormState {
  switch (action.type) {
    case 'setTripType': {
      const returnDate =
        action.tripType === 'oneway'
          ? null
          : (state.returnDate ?? minDate(BOOKING_HORIZON, addDays(state.departDate, 7)));
      return {
        ...state,
        tripType: action.tripType,
        returnDate,
        extraLegs: chainLegDates(state.departDate, state.extraLegs),
      };
    }
    case 'typePlace':
      return { ...state, [action.field]: placeFromQuery(action.query) };
    case 'choosePlace':
      return { ...state, [action.field]: placeFromCode(action.code) };
    case 'swapPlaces':
      return { ...state, from: state.to, to: state.from };
    case 'typeLegPlace': {
      const extraLegs = state.extraLegs.map((leg, index) =>
        index === action.index ? { ...leg, [action.field]: placeFromQuery(action.query) } : leg,
      );
      return { ...state, extraLegs };
    }
    case 'pickDate':
      return pickDate(state, action.target, action.date);
    case 'changeTravelers': {
      const limits = travelerLimits(state, action.kind);
      if ((action.delta > 0 && !limits.canIncrease) || (action.delta < 0 && !limits.canDecrease)) {
        return state;
      }
      const next = { ...state, [action.kind]: state[action.kind] + action.delta };
      // Removing an adult also removes an infant who would be left without a lap.
      if (action.kind === 'adults') next.infants = Math.min(next.infants, next.adults);
      return next;
    }
    case 'setCabin':
      return { ...state, cabin: action.cabin };
    case 'toggleFlexibleDates':
      return { ...state, flexibleDates: !state.flexibleDates };
    case 'addLeg': {
      if (state.extraLegs.length >= MAX_EXTRA_LEGS) return state;
      const lastLeg = state.extraLegs[state.extraLegs.length - 1];
      const usedCodes = [state.from.code, ...state.extraLegs.map((leg) => leg.to.code)];
      const nextCode =
        NEXT_LEG_DESTINATIONS.find((code) => code !== lastLeg.to.code && !usedCodes.includes(code)) ?? 'MNL';
      const newLeg = {
        from: lastLeg.to,
        to: placeFromCode(findAirport(nextCode)?.code ?? 'MNL'),
        date: minDate(BOOKING_HORIZON, addDays(lastLeg.date, 3)),
      };
      return { ...state, extraLegs: [...state.extraLegs, newLeg] };
    }
    case 'removeLeg':
      if (state.extraLegs.length <= 1) return state;
      return { ...state, extraLegs: state.extraLegs.filter((_, index) => index !== action.index) };
    case 'trySearch':
      return { ...state, hasTriedSearch: true };
    default:
      return state;
  }
}

function pickDate(state: SearchFormState, target: CalendarTarget, date: IsoDate): SearchFormState {
  if (target.kind === 'leg') {
    const extraLegs = state.extraLegs.map((leg, index) => (index === target.index ? { ...leg, date } : leg));
    return { ...state, extraLegs: chainLegDates(state.departDate, extraLegs) };
  }
  if (state.tripType !== 'round') {
    return { ...state, departDate: date, extraLegs: chainLegDates(date, state.extraLegs) };
  }
  if (target.kind === 'depart' || date < state.departDate) {
    const returnDate = state.returnDate && state.returnDate > date ? state.returnDate : null;
    return { ...state, departDate: date, returnDate };
  }
  return { ...state, returnDate: date };
}

/** After a pick, which date the calendar should choose next (null closes it). */
export function nextCalendarTarget(
  state: SearchFormState,
  target: CalendarTarget,
  pickedDate: IsoDate,
): CalendarTarget | null {
  if (target.kind === 'leg' || state.tripType !== 'round') return null;
  if (target.kind === 'depart' || pickedDate < state.departDate) return { kind: 'return' };
  return { kind: 'depart' };
}
