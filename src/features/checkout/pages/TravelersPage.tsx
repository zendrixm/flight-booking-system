import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { PageLoader } from '@/components/layout';
import { Alert, Button, Checkbox } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { AIRLINES } from '@/data/airports';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { pluralize } from '@/lib/format';
import { listSavedTravelers } from '@/services/travelersService';
import { fullNameOf } from '@/types/customer';
import type { SavedTraveler } from '@/types/traveler';

import { StepActions } from '../components/StepActions';
import { StepIntro } from '../components/StepIntro';
import { ContactDetailsCard } from '../components/travelers/ContactDetailsCard';
import { SavedTravelersBar } from '../components/travelers/SavedTravelersBar';
import { TravelerCard } from '../components/travelers/TravelerCard';
import { useCheckoutContext } from '../hooks/useCheckoutContext';
import { useTravelersForm } from '../hooks/useTravelersForm';
import { resultsUrlFor } from '../lib/checkoutSteps';
import {
  initialContact,
  initialTravelers,
  isSamePerson,
  passengerTypesFor,
  travelerFromSaved,
} from '../lib/travelerDefaults';
import { minimumPassportExpiry } from '../lib/travelerValidation';
import { saveTravelers, useCheckout } from '../state/checkoutStore';

export function TravelersPage() {
  useDocumentTitle('Who’s flying?');
  const savedTravelers = useAsyncData('saved-travelers', listSavedTravelers);

  return (
    <>
      <StepIntro title="Who’s flying?">
        Enter names exactly as they appear on each passport. Names can’t be changed once tickets are issued.
      </StepIntro>
      {savedTravelers.data ? <TravelersForm savedTravelers={savedTravelers.data} /> : <PageLoader />}
    </>
  );
}

function TravelersForm({ savedTravelers }: { savedTravelers: SavedTraveler[] }) {
  const navigate = useNavigate();
  const { customer } = useSession();
  const { selection, checkout } = useCheckoutContext();
  const saveToProfileDefault = useCheckout((state) => state.saveTravelersToProfile);
  const summaryRef = useRef<HTMLDivElement>(null);

  const passengerTypes = passengerTypesFor(selection.search);
  const lastFlightDate = selection.search.returnDate ?? selection.search.departDate;
  const minPassportExpiry = minimumPassportExpiry(lastFlightDate);
  const airlineName = AIRLINES[selection.offer.airlineId].name;
  const accountHolder = savedTravelers.find((traveler) => traveler.isAccountHolder);

  const form = useTravelersForm(
    {
      travelers:
        checkout.travelers.length === passengerTypes.length
          ? checkout.travelers
          : initialTravelers(passengerTypes.length, accountHolder),
      contact: checkout.contact ?? initialContact(customer?.email ?? '', customer?.mobile ?? ''),
    },
    { today: DEMO_TODAY, minPassportExpiry },
  );
  const [saveToProfile, setSaveToProfile] = useState(saveToProfileDefault);
  /** Bumped on each blocked attempt so the error summary takes focus once it has rendered. */
  const [blockedAttempts, setBlockedAttempts] = useState(0);

  useEffect(() => {
    if (blockedAttempts > 0) summaryRef.current?.focus();
  }, [blockedAttempts]);

  const fillNextTraveler = (saved: SavedTraveler) => {
    const index = form.travelers.findIndex((traveler) => !traveler.firstNames && !traveler.lastName);
    if (index >= 0) form.updateTraveler(index, travelerFromSaved(saved, form.travelers[index]));
  };

  const handleContinue = () => {
    if (!form.submit()) {
      setBlockedAttempts((count) => count + 1);
      return;
    }
    saveTravelers(form.travelers, form.contact, saveToProfile);
    navigate(paths.checkout.seats);
  };

  const hint =
    form.visibleErrorCount > 0
      ? `Fix ${pluralize(form.visibleErrorCount, 'issue')} to continue`
      : form.errorCount === 0
        ? 'All travelers complete'
        : undefined;

  return (
    <>
      {customer && (
        <SavedTravelersBar
          accountName={fullNameOf({ firstName: customer.firstName, lastName: customer.lastName })}
          savedTravelers={savedTravelers.filter((traveler) => traveler.passportNumber)}
          travelers={form.travelers}
          onUse={fillNextTraveler}
        />
      )}

      {form.hasSubmitted && form.errorCount > 0 && (
        <div ref={summaryRef} tabIndex={-1}>
          <Alert tone="danger" role="alert">
            {form.errorCount === 1
              ? '1 detail needs fixing before you continue.'
              : `${form.errorCount} details need fixing before you continue.`}{' '}
            Fields that need attention are marked in red.
          </Alert>
        </div>
      )}

      <ContactDetailsCard
        contact={form.contact}
        mobileError={form.visibleMobileError}
        onChange={form.setContact}
        onMobileBlur={form.touchMobile}
      />

      {form.travelers.map((traveler, index) => {
        const passportFix = savedTravelers.find(
          (saved) =>
            isSamePerson(traveler, saved) &&
            saved.passportExpiry >= minPassportExpiry &&
            saved.passportNumber !== traveler.passportNumber,
        );
        return (
          <TravelerCard
            key={index}
            index={index}
            passengerType={passengerTypes[index]}
            traveler={traveler}
            errors={form.visibleTravelerErrors(index)}
            isComplete={Object.keys(form.travelerErrors[index] ?? {}).length === 0}
            airlineName={airlineName}
            minPassportExpiry={minPassportExpiry}
            passportFix={passportFix}
            onChange={(patch) => form.updateTraveler(index, patch)}
            onBlur={(field) => form.touchTraveler(index, field)}
          />
        );
      })}

      <Checkbox
        label="Save traveler details to my profile for faster checkout next time. Passport numbers are stored encrypted."
        checked={saveToProfile}
        onChange={(event) => setSaveToProfile(event.target.checked)}
      />

      <StepActions
        backTo={resultsUrlFor(selection.search)}
        backLabel="Back to flights"
        hint={hint}
        hintTone={form.visibleErrorCount > 0 ? 'danger' : form.errorCount === 0 ? 'success' : 'neutral'}
      >
        <Button variant="primary" size="large" iconEnd="arrowRight" onClick={handleContinue}>
          Continue to seats
        </Button>
      </StepActions>
    </>
  );
}
