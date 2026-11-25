import { describe, expect, it } from 'vitest';

import {
  getSearchErrors,
  INITIAL_SEARCH_FORM,
  placeFromQuery,
  toSearchParams,
  travelersLabel,
  type SearchFormState,
} from './searchForm';
import { nextCalendarTarget, searchFormReducer } from './searchFormReducer';

const initial = INITIAL_SEARCH_FORM;

describe('searchFormReducer', () => {
  it('swaps origin and destination', () => {
    const next = searchFormReducer(initial, { type: 'swapPlaces' });
    expect(next.from.code).toBe('HND');
    expect(next.to.code).toBe('MNL');
  });

  it('drops the return date for one way and restores a week-long trip for round trip', () => {
    const oneWay = searchFormReducer(initial, { type: 'setTripType', tripType: 'oneway' });
    expect(oneWay.returnDate).toBeNull();
    const round = searchFormReducer(oneWay, { type: 'setTripType', tripType: 'round' });
    expect(round.returnDate).toBe('2026-11-19');
  });

  it('keeps one lap infant per adult when an adult is removed', () => {
    let state = searchFormReducer(initial, { type: 'changeTravelers', kind: 'infants', delta: 1 });
    state = searchFormReducer(state, { type: 'changeTravelers', kind: 'infants', delta: 1 });
    expect(state.infants).toBe(2);
    state = searchFormReducer(state, { type: 'changeTravelers', kind: 'adults', delta: -1 });
    expect(state).toMatchObject({ adults: 1, infants: 1 });
    expect(searchFormReducer(state, { type: 'changeTravelers', kind: 'infants', delta: 1 }).infants).toBe(1);
  });

  it('never goes below one adult', () => {
    const one = { ...initial, adults: 1 };
    expect(searchFormReducer(one, { type: 'changeTravelers', kind: 'adults', delta: -1 }).adults).toBe(1);
  });

  it('starts a new range when the return is picked before the departure', () => {
    const next = searchFormReducer(initial, {
      type: 'pickDate',
      target: { kind: 'return' },
      date: '2026-11-10',
    });
    expect(next).toMatchObject({ departDate: '2026-11-10', returnDate: '2026-11-19' });
  });

  it('moves from the departure to the return date after a pick', () => {
    expect(nextCalendarTarget(initial, { kind: 'depart' }, '2026-11-14')).toEqual({ kind: 'return' });
    expect(nextCalendarTarget(initial, { kind: 'return' }, '2026-11-20')).toEqual({ kind: 'depart' });
    expect(
      nextCalendarTarget({ ...initial, tripType: 'oneway' }, { kind: 'depart' }, '2026-11-14'),
    ).toBeNull();
  });

  it('adds multi-city flights up to four in total', () => {
    let state: SearchFormState = { ...initial, tripType: 'multi' };
    state = searchFormReducer(state, { type: 'addLeg' });
    state = searchFormReducer(state, { type: 'addLeg' });
    state = searchFormReducer(state, { type: 'addLeg' });
    expect(state.extraLegs).toHaveLength(3);
    expect(state.extraLegs[1].from.code).toBe(state.extraLegs[0].to.code);
  });
});

describe('search validation', () => {
  it('asks for airports it recognises', () => {
    const state = { ...initial, to: placeFromQuery('Zurich'), hasTriedSearch: true };
    expect(getSearchErrors(state)).toEqual([
      { field: 'to', message: 'We don’t recognise “Zurich”. Choose a destination from the list.' },
    ]);
  });

  it('rejects the same origin and destination', () => {
    const state = { ...initial, to: initial.from };
    expect(getSearchErrors(state).map((error) => error.field)).toEqual(['to']);
  });

  it('needs a return date on round trips', () => {
    expect(getSearchErrors({ ...initial, returnDate: null })[0].field).toBe('return');
  });

  it('turns the form into URL parameters', () => {
    expect(toSearchParams(initial)).toMatchObject({
      from: 'MNL',
      to: 'HND',
      returnDate: '2026-11-19',
      adults: 2,
    });
    expect(travelersLabel({ adults: 2, children: 1, infants: 0, cabin: 'Economy' })).toBe(
      '2 adults, 1 child · Economy',
    );
  });
});
