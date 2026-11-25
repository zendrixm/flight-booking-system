import { createBrowserRouter, type RouteObject } from 'react-router';

import { PageLoader } from '@/components/layout';
import { AccountLayout } from '@/features/account/components/AccountLayout';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { CheckoutLayout } from '@/features/checkout/components/CheckoutLayout';
import { RouteErrorPage } from '@/features/errors/pages/RouteErrorPage';
import { ConsoleLayout } from '@/layouts/console/ConsoleLayout';
import { PhoneAppLayout } from '@/layouts/phone/PhoneAppLayout';
import { PhoneTabsLayout } from '@/layouts/phone/PhoneTabsLayout';
import { SiteLayout } from '@/layouts/SiteLayout';

import { lazyPage } from './lazyPage';

const customerRoutes: RouteObject[] = [
  { index: true, lazy: lazyPage(() => import('@/features/booking/pages/HomePage'), 'HomePage') },
  { path: 'flights', lazy: lazyPage(() => import('@/features/booking/pages/ResultsPage'), 'ResultsPage') },
  {
    path: 'booking/confirmed',
    lazy: lazyPage(() => import('@/features/checkout/pages/ConfirmationPage'), 'ConfirmationPage'),
  },
  {
    path: 'trips/:reference',
    handle: { hideFooter: true },
    lazy: lazyPage(() => import('@/features/trips/pages/ManageBookingPage'), 'ManageBookingPage'),
  },
  {
    path: 'trips/:reference/boarding-pass',
    handle: { hideFooter: true },
    lazy: lazyPage(() => import('@/features/trips/pages/BoardingPassPage'), 'BoardingPassPage'),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AccountLayout />,
        children: [
          { path: 'trips', lazy: lazyPage(() => import('@/features/trips/pages/TripsPage'), 'TripsPage') },
          {
            path: 'account/travelers',
            lazy: lazyPage(() => import('@/features/account/pages/SavedTravelersPage'), 'SavedTravelersPage'),
          },
          {
            path: 'account/payment-methods',
            lazy: lazyPage(() => import('@/features/account/pages/PaymentMethodsPage'), 'PaymentMethodsPage'),
          },
          {
            path: 'account/price-alerts',
            lazy: lazyPage(() => import('@/features/account/pages/PriceAlertsPage'), 'PriceAlertsPage'),
          },
          {
            path: 'account/settings',
            lazy: lazyPage(
              () => import('@/features/account/pages/AccountSettingsPage'),
              'AccountSettingsPage',
            ),
          },
        ],
      },
    ],
  },
  { path: 'help', lazy: lazyPage(() => import('@/features/help/pages/HelpPage'), 'HelpPage') },
  {
    path: 'help/articles/:articleId',
    lazy: lazyPage(() => import('@/features/help/pages/HelpArticlePage'), 'HelpArticlePage'),
  },
  {
    path: 'destinations',
    lazy: lazyPage(() => import('@/features/destinations/pages/DestinationsPage'), 'DestinationsPage'),
  },
  {
    path: 'about',
    lazy: lazyPage(() => import('@/features/about/pages/AboutPage'), 'AboutPage'),
  },
  {
    path: 'legal/:document?',
    lazy: lazyPage(() => import('@/features/legal/pages/LegalPage'), 'LegalPage'),
  },
  { path: 'sign-out', lazy: lazyPage(() => import('@/features/auth/pages/SignOutPage'), 'SignOutPage') },
  { path: '*', lazy: lazyPage(() => import('@/features/errors/pages/NotFoundPage'), 'NotFoundPage') },
];

const checkoutRoutes: RouteObject[] = [
  {
    path: 'travelers',
    lazy: lazyPage(() => import('@/features/checkout/pages/TravelersPage'), 'TravelersPage'),
  },
  { path: 'seats', lazy: lazyPage(() => import('@/features/checkout/pages/SeatsPage'), 'SeatsPage') },
  { path: 'extras', lazy: lazyPage(() => import('@/features/checkout/pages/ExtrasPage'), 'ExtrasPage') },
  { path: 'payment', lazy: lazyPage(() => import('@/features/checkout/pages/PaymentPage'), 'PaymentPage') },
];

/** Vela Console: everything below /console except sign-in needs a staff session. */
const consoleRoutes: RouteObject[] = [
  {
    index: true,
    lazy: lazyPage(() => import('@/features/console/dashboard/pages/DashboardPage'), 'DashboardPage'),
  },
  {
    path: 'bookings',
    lazy: lazyPage(() => import('@/features/console/bookings/pages/BookingsPage'), 'BookingsPage'),
  },
  {
    path: 'bookings/:reference',
    lazy: lazyPage(() => import('@/features/console/bookings/pages/BookingDetailPage'), 'BookingDetailPage'),
  },
  {
    path: 'flights',
    lazy: lazyPage(() => import('@/features/console/flights/pages/FlightsPage'), 'FlightsPage'),
  },
  {
    path: 'refunds',
    lazy: lazyPage(() => import('@/features/console/refunds/pages/RefundsPage'), 'RefundsPage'),
  },
  {
    path: 'pricing',
    lazy: lazyPage(() => import('@/features/console/pricing/pages/PricingPage'), 'PricingPage'),
  },
  {
    path: 'customers',
    lazy: lazyPage(() => import('@/features/console/customers/pages/CustomersPage'), 'CustomersPage'),
  },
  { path: 'users', lazy: lazyPage(() => import('@/features/console/users/pages/UsersPage'), 'UsersPage') },
  {
    path: 'settings',
    lazy: lazyPage(() => import('@/features/console/settings/pages/SettingsPage'), 'SettingsPage'),
  },
];

/** The phone app. Search works signed out; the other tabs and the boarding pass need an account. */
const phoneRoutes: RouteObject[] = [
  {
    element: <PhoneTabsLayout />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import('@/features/phone/search/pages/PhoneSearchPage'), 'PhoneSearchPage'),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: 'trips',
            lazy: lazyPage(() => import('@/features/phone/trips/pages/PhoneTripsPage'), 'PhoneTripsPage'),
          },
          {
            path: 'alerts',
            lazy: lazyPage(() => import('@/features/phone/alerts/pages/PhoneAlertsPage'), 'PhoneAlertsPage'),
          },
          {
            path: 'account',
            lazy: lazyPage(
              () => import('@/features/phone/account/pages/PhoneAccountPage'),
              'PhoneAccountPage',
            ),
          },
        ],
      },
    ],
  },
  {
    path: 'results',
    lazy: lazyPage(() => import('@/features/phone/results/pages/PhoneResultsPage'), 'PhoneResultsPage'),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: 'boarding-pass/:reference',
        lazy: lazyPage(
          () => import('@/features/phone/boarding-pass/pages/PhoneBoardingPassPage'),
          'PhoneBoardingPassPage',
        ),
      },
    ],
  },
];

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <SiteLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    children: [{ errorElement: <RouteErrorPage />, children: customerRoutes }],
  },
  {
    path: '/sign-in',
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: lazyPage(() => import('@/features/auth/pages/SignInPage'), 'SignInPage'),
  },
  {
    path: '/create-account',
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: lazyPage(() => import('@/features/auth/pages/CreateAccountPage'), 'CreateAccountPage'),
  },
  {
    path: '/checkout',
    element: <CheckoutLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    children: checkoutRoutes,
  },
  {
    path: '/console/login',
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: lazyPage(() => import('@/features/console/auth/pages/ConsoleLoginPage'), 'ConsoleLoginPage'),
  },
  {
    path: '/console',
    element: <ConsoleLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    children: [{ errorElement: <RouteErrorPage />, children: consoleRoutes }],
  },
  {
    path: '/design-system',
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: lazyPage(() => import('@/features/design-system/pages/DesignSystemPage'), 'DesignSystemPage'),
  },
  {
    path: '/app',
    element: <PhoneAppLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    children: [{ errorElement: <RouteErrorPage />, children: phoneRoutes }],
  },
];

export const router = createBrowserRouter(routes);
