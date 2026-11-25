import type { LegalDocumentId } from '@/types/legal';

/** Every URL in one place. Use these helpers instead of hard-coding paths in components. */
export const paths = {
  home: '/',
  flights: '/flights',
  checkout: {
    travelers: '/checkout/travelers',
    seats: '/checkout/seats',
    extras: '/checkout/extras',
    payment: '/checkout/payment',
  },
  bookingConfirmed: '/booking/confirmed',
  trips: '/trips',
  trip: (reference: string) => `/trips/${reference}`,
  /** The "Already booked?" lookup on the home page, for guests and signed-out travelers. */
  findBooking: '/#find-booking',
  boardingPass: (reference: string) => `/trips/${reference}/boarding-pass`,
  account: {
    travelers: '/account/travelers',
    paymentMethods: '/account/payment-methods',
    priceAlerts: '/account/price-alerts',
    settings: '/account/settings',
  },
  signIn: '/sign-in',
  createAccount: '/create-account',
  signOut: '/sign-out',
  help: '/help',
  helpSearch: (query: string) => `/help?q=${encodeURIComponent(query)}`,
  helpArticle: (articleId: string) => `/help/articles/${articleId}`,
  destinations: '/destinations',
  about: '/about',
  /** Terms of carriage is the default document at /legal. */
  legal: (document?: LegalDocumentId) => (document ? `/legal/${document}` : '/legal'),
  console: {
    login: '/console/login',
    dashboard: '/console',
    bookings: '/console/bookings',
    booking: (reference: string) => `/console/bookings/${reference}`,
    flights: '/console/flights',
    /** Opens the flight's details on Flight operations, e.g. "PQ117". */
    flight: (flightId: string) => `/console/flights?flight=${encodeURIComponent(flightId)}`,
    refunds: '/console/refunds',
    /** Opens a refund request in the review panel, e.g. "VL1FJS". */
    refund: (reference: string) => `/console/refunds?request=${encodeURIComponent(reference)}`,
    pricing: '/console/pricing',
    customers: '/console/customers',
    /** Opens the customer's drawer on the Customers page. */
    customer: (customerId: string) => `/console/customers?customer=${encodeURIComponent(customerId)}`,
    users: '/console/users',
    settings: '/console/settings',
    /** A settings tab, e.g. "security". */
    settingsTab: (tab: 'general' | 'payments' | 'notifications' | 'integrations' | 'security') =>
      `/console/settings?tab=${tab}`,
  },
  /** The phone app: four tabs, plus full-screen results and boarding pass. */
  phone: {
    search: '/app',
    trips: '/app/trips',
    alerts: '/app/alerts',
    account: '/app/account',
    /** Pass `searchToQueryString(params)` from lib/flightSearchUrl. */
    results: (queryString?: string) => (queryString ? `/app/results?${queryString}` : '/app/results'),
    boardingPass: (reference: string) => `/app/boarding-pass/${reference}`,
  },
  designSystem: '/design-system',
} as const;
