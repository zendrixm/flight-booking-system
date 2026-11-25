import { useEffect } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router';

import { paths } from '@/app/paths';
import { scrollRestorationKey } from '@/app/scrollRestoration';
import { PageContainer } from '@/components/layout';
import type { CheckoutStepId } from '@/types/checkout';

import type { CheckoutOutletContext } from '../hooks/useCheckoutContext';
import { CHECKOUT_STEP_ORDER, CHECKOUT_STEPS } from '../lib/checkoutSteps';
import { computeTripPrice } from '../lib/pricing';
import { checkoutStore, reachStep, useCheckout } from '../state/checkoutStore';
import { CheckoutHeader } from './CheckoutHeader';
import styles from './CheckoutLayout.module.css';
import { CheckoutTripSummary } from './CheckoutTripSummary';

/**
 * Chrome for the four checkout steps: the step header, the page and the trip summary.
 * Without a chosen flight there is nothing to check out, so it sends people back to the results.
 */
export function CheckoutLayout() {
  const checkout = useCheckout((state) => state);
  const { pathname } = useLocation();
  const currentStep: CheckoutStepId =
    CHECKOUT_STEPS.find((step) => step.path === pathname)?.id ?? 'travelers';

  useEffect(() => {
    if (checkoutStore.getState().selection) reachStep(currentStep, CHECKOUT_STEP_ORDER);
  }, [currentStep]);

  if (!checkout.selection) return <Navigate to={paths.flights} replace />;
  // Once paid, the steps are closed. The payment page stays up to show its "approved" dialog.
  if (checkout.confirmedReference && currentStep !== 'payment') {
    return <Navigate to={paths.bookingConfirmed} replace />;
  }

  const price = computeTripPrice(checkout);
  const context: CheckoutOutletContext = { checkout, selection: checkout.selection, price };
  // The seat map needs a third column, so that step places the trip summary itself.
  const pagePlacesSummary = currentStep === 'seats';

  return (
    <div className={styles.shell}>
      <CheckoutHeader currentStep={currentStep} furthestStep={checkout.furthestStep} />
      {pagePlacesSummary ? (
        <PageContainer as="main">
          <Outlet context={context} />
        </PageContainer>
      ) : (
        <PageContainer as="main" layout="plain" className={styles.layout}>
          <div className={styles.content}>
            <Outlet context={context} />
          </div>
          <div className={styles.aside}>
            <CheckoutTripSummary />
          </div>
        </PageContainer>
      )}
      <ScrollRestoration getKey={scrollRestorationKey} />
    </div>
  );
}
