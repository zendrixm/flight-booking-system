import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, ChoiceCard, StatusChip, Switch, useToast } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { formatDayMonth, formatDayRange } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type { ExtrasSelection } from '@/types/checkout';
import type { AddOnId, BagOptionId } from '@/types/checkout';

import { ExtrasSection } from '../components/extras/ExtrasSection';
import { ProtectionPolicyDialog } from '../components/extras/ProtectionPolicyDialog';
import { StepActions } from '../components/StepActions';
import { StepIntro } from '../components/StepIntro';
import { useCheckoutContext } from '../hooks/useCheckoutContext';
import {
  ADD_ONS,
  BAG_OPTIONS,
  PROTECTION_COVERAGE,
  PROTECTION_PRICE_PER_TRAVELER,
} from '../lib/extrasCatalog';
import { saveExtras } from '../state/checkoutStore';
import styles from './ExtrasPage.module.css';

export function ExtrasPage() {
  useDocumentTitle('Bags and extras');
  const navigate = useNavigate();
  const toast = useToast();
  const { checkout, selection } = useCheckoutContext();
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [hasTriedContinue, setHasTriedContinue] = useState(false);
  const protectionRef = useRef<HTMLFieldSetElement>(null);

  const extras = checkout.extras;
  const travelerNames = checkout.travelers.map((traveler, index) =>
    traveler.firstNames
      ? `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`
      : `Traveler ${index + 1}`,
  );
  const travelerCount = travelerNames.length || 1;
  const protectionTotal = PROTECTION_PRICE_PER_TRAVELER * travelerCount;
  const { departDate, returnDate } = selection.search;
  const tripDates = returnDate ? formatDayRange(departDate, returnDate) : formatDayMonth(departDate);
  const needsProtectionChoice = extras.hasProtection === null;

  useEffect(() => {
    if (hasTriedContinue && needsProtectionChoice) protectionRef.current?.focus();
  }, [hasTriedContinue, needsProtectionChoice]);

  const update = (patch: Partial<ExtrasSelection>) => saveExtras({ ...extras, ...patch });

  const setBag = (index: number, bag: BagOptionId) =>
    update({ bags: travelerNames.map((_, i) => (i === index ? bag : (extras.bags[i] ?? 'included'))) });

  const toggleAddOn = (id: AddOnId, isOn: boolean) =>
    update({ addOns: isOn ? [...extras.addOns, id] : extras.addOns.filter((addOn) => addOn !== id) });

  const handleContinue = () => {
    setHasTriedContinue(true);
    if (needsProtectionChoice) return;
    navigate(paths.checkout.payment);
  };

  return (
    <>
      <StepIntro title="Bags and extras">
        Adding bags now costs less than at the airport. Anything here can also be added later from Manage
        booking.
      </StepIntro>

      <ExtrasSection
        id="bags-title"
        icon="luggage"
        title="Checked baggage"
        description="Your Classic fare includes one 23 kg bag each way. Prices below cover both flights."
        badge={<StatusChip tone="success">1 × 23 kg included</StatusChip>}
      >
        {travelerNames.map((name, index) => (
          <fieldset key={name} className={styles.bagGroup}>
            <legend className={styles.bagLegend}>{name}</legend>
            <div className={styles.bagOptions}>
              {BAG_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.id}
                  name={`bags-${index}`}
                  layout="stacked"
                  indicator="end"
                  title={option.label}
                  description={option.description}
                  meta={option.price ? `+${formatPeso(option.price)}` : 'Included'}
                  checked={(extras.bags[index] ?? 'included') === option.id}
                  onChange={() => setBag(index, option.id)}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </ExtrasSection>

      <ExtrasSection
        id="protection-title"
        icon="shield"
        title="Vela Protect"
        description={`Travel protection for ${travelerCount === 1 ? 'you' : `all ${travelerCount} travelers`}, underwritten by a licensed insurer. Please choose an option to continue.`}
      >
        <fieldset
          ref={protectionRef}
          tabIndex={-1}
          className={styles.protection}
          aria-invalid={hasTriedContinue && needsProtectionChoice}
          aria-describedby={hasTriedContinue && needsProtectionChoice ? 'protection-error' : undefined}
        >
          <legend className="visually-hidden">Travel protection</legend>
          <ChoiceCard
            name="protection"
            layout="stacked"
            indicator="end"
            title="Protect this trip"
            description={`${formatPeso(PROTECTION_PRICE_PER_TRAVELER)} per traveler`}
            checked={extras.hasProtection === true}
            onChange={() => update({ hasProtection: true })}
          >
            <ul className={styles.coverage}>
              {PROTECTION_COVERAGE.map((item) => (
                <li key={item} className={styles.coverageItem}>
                  <Icon name="check" size={16} strokeWidth={2} className={styles.coverageIcon} />
                  {item}
                </li>
              ))}
            </ul>
          </ChoiceCard>
          <ChoiceCard
            name="protection"
            layout="stacked"
            indicator="end"
            title="No protection"
            description="I’ll cover any unexpected costs myself"
            checked={extras.hasProtection === false}
            onChange={() => update({ hasProtection: false })}
          />
        </fieldset>
        {hasTriedContinue && needsProtectionChoice && (
          <p id="protection-error" role="alert" className={styles.error}>
            Choose whether to protect this trip to continue.
          </p>
        )}
        <Button
          variant="ghost"
          className={styles.policyLink}
          aria-haspopup="dialog"
          onClick={() => setIsPolicyOpen(true)}
        >
          Read the policy wording
        </Button>
      </ExtrasSection>

      <ExtrasSection id="comfort-title" title="Comfort add-ons">
        <ul className={styles.addOns}>
          {ADD_ONS.map((addOn) => (
            <li key={addOn.id} className={styles.addOn} aria-disabled={!addOn.isAvailable || undefined}>
              <span className={styles.addOnIcon}>
                <Icon name={addOn.icon} size={20} />
              </span>
              <span className={styles.addOnText}>
                <span className={styles.addOnLabel}>{addOn.label}</span>
                <span className={styles.addOnDescription}>{addOn.description}</span>
              </span>
              <span className={styles.addOnPrice}>
                {addOn.isAvailable ? `+${formatPeso(addOn.price)}` : 'Unavailable'}
              </span>
              <Switch
                label={addOn.label}
                labelHidden
                disabled={!addOn.isAvailable}
                checked={extras.addOns.includes(addOn.id)}
                onChange={(isOn) => toggleAddOn(addOn.id, isOn)}
              />
            </li>
          ))}
        </ul>
      </ExtrasSection>

      <StepActions
        backTo={paths.checkout.seats}
        backLabel="Back to seats"
        hint={
          hasTriedContinue && needsProtectionChoice ? 'Choose a protection option to continue' : undefined
        }
        hintTone="danger"
      >
        <Button variant="primary" size="large" iconEnd="arrowRight" onClick={handleContinue}>
          Continue to payment
        </Button>
      </StepActions>

      <ProtectionPolicyDialog
        open={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        coverageLabel={`covers ${returnDate ? 'both flights' : 'your flight'}, ${tripDates}`}
        hasProtection={extras.hasProtection === true}
        totalPrice={protectionTotal}
        onDownload={() =>
          toast.show({ tone: 'success', message: 'Policy downloaded · Vela-Protect-policy.pdf' })
        }
        onKeep={() => {
          update({ hasProtection: true });
          setIsPolicyOpen(false);
        }}
      />
    </>
  );
}
