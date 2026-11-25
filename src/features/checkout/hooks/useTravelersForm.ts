import { useMemo, useState } from 'react';

import type { IsoDate } from '@/lib/date';
import type { ContactDetails, TravelerDetails } from '@/types/traveler';

import {
  countErrors,
  validateContactMobile,
  validateTraveler,
  type TravelerErrors,
  type TravelerField,
} from '../lib/travelerValidation';

interface Options {
  today: IsoDate;
  minPassportExpiry: IsoDate;
}

const MOBILE_KEY = 'contact.mobile';

/**
 * State and validation for the "Who's flying?" step. Errors are computed on every change but
 * only shown for fields the person has left, or for everything after they try to continue.
 */
export function useTravelersForm(
  initial: { travelers: TravelerDetails[]; contact: ContactDetails },
  { today, minPassportExpiry }: Options,
) {
  const [travelers, setTravelers] = useState(initial.travelers);
  const [contact, setContactState] = useState(initial.contact);
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const travelerErrors = useMemo(
    () => travelers.map((traveler) => validateTraveler(traveler, today, minPassportExpiry)),
    [travelers, today, minPassportExpiry],
  );
  const mobileError = validateContactMobile(contact);
  const errorCount = countErrors(travelerErrors, mobileError);

  const isVisible = (key: string) => hasSubmitted || touched.has(key);

  const visibleTravelerErrors = (index: number): TravelerErrors => {
    const entries = Object.entries(travelerErrors[index] ?? {}).filter(([field]) =>
      isVisible(`${index}.${field}`),
    );
    return Object.fromEntries(entries) as TravelerErrors;
  };

  const visibleMobileError = isVisible(MOBILE_KEY) ? mobileError : undefined;
  const visibleErrorCount = countErrors(
    travelers.map((_, index) => visibleTravelerErrors(index)),
    visibleMobileError,
  );

  const markTouched = (key: string) =>
    setTouched((previous) => (previous.has(key) ? previous : new Set(previous).add(key)));

  return {
    travelers,
    contact,
    travelerErrors,
    visibleMobileError,
    visibleTravelerErrors,
    errorCount,
    visibleErrorCount,
    hasSubmitted,
    setContact: (patch: Partial<ContactDetails>) =>
      setContactState((previous) => ({ ...previous, ...patch })),
    updateTraveler: (index: number, patch: Partial<TravelerDetails>) =>
      setTravelers((previous) =>
        previous.map((traveler, i) => (i === index ? { ...traveler, ...patch } : traveler)),
      ),
    touchTraveler: (index: number, field: TravelerField) => markTouched(`${index}.${field}`),
    touchMobile: () => markTouched(MOBILE_KEY),
    /** Shows every error; returns true when the form can be saved. */
    submit: () => {
      setHasSubmitted(true);
      return errorCount === 0;
    },
  };
}

export type TravelersForm = ReturnType<typeof useTravelersForm>;
