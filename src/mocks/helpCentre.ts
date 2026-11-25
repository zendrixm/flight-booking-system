import { paths } from '@/app/paths';
import type { CallbackSlot, HelpArticle, HelpTopic, RefundStatus, TravelAdvisory } from '@/types/help';

const MANAGE_BOOKING = { label: 'Manage booking', to: paths.trips };

export const HELP_TOPICS: readonly HelpTopic[] = [
  {
    id: 'bookings',
    label: 'Bookings and changes',
    icon: 'edit',
    description: 'Change dates, fix names and cancel. Most changes take a minute in Manage booking.',
    action: { label: 'Open Manage booking', to: paths.trips },
  },
  {
    id: 'payments',
    label: 'Payments and refunds',
    icon: 'creditCard',
    description: 'Refund timelines, payment methods, receipts and Vela travel credit.',
    action: { label: 'Track a refund', to: `${paths.help}#refund` },
  },
  {
    id: 'baggage',
    label: 'Baggage',
    icon: 'luggage',
    description: 'What’s included, adding bags, special items and what to do if a bag goes missing.',
    action: { label: 'Add bags to a trip', to: paths.trips },
  },
  {
    id: 'checkin',
    label: 'Check-in and boarding',
    icon: 'ticket',
    description: 'Online check-in opens 48 hours before departure. Seats, boarding passes and airport tips.',
    action: { label: 'Check in online', to: paths.trips },
  },
  {
    id: 'documents',
    label: 'Travel documents',
    icon: 'passport',
    description: 'Passports, visas and entry rules for where you’re going, including for children.',
    action: { label: 'Update passport details', to: paths.account.travelers },
  },
  {
    id: 'account',
    label: 'Account and privacy',
    icon: 'user',
    description: 'Signing in, verification codes, family bookings and your personal data.',
    action: { label: 'Account settings', to: paths.account.settings },
  },
];

export const HELP_ARTICLES: readonly HelpArticle[] = [
  {
    id: 'change-flight',
    topicId: 'bookings',
    question: 'How do I change my flight?',
    answer:
      'Open Manage booking and choose Change flights. Classic fares can be changed for ₱2,500 per traveler plus any fare difference, up to 3 hours before departure. Flex fares change for free. Saver fares can’t be changed.',
    link: MANAGE_BOOKING,
    details: {
      updatedOn: '2 Oct 2026',
      readingMinutes: 3,
      helpfulNote: '1,284 travelers found this helpful',
      table: {
        title: 'What a change costs',
        rows: [
          { label: 'Saver', value: 'Can’t be changed', note: 'Cancel for travel credit instead' },
          { label: 'Classic', value: '₱2,500 per traveler', note: 'Plus any fare difference' },
          { label: 'Flex', value: 'Free', note: 'Plus any fare difference' },
        ],
      },
      steps: [
        {
          title: 'Open Manage booking',
          detail: 'Pick the trip from My trips, or enter your booking reference and last name.',
        },
        {
          title: 'Choose Change flights',
          detail: 'Pick what to change: the outbound flight, the return or both.',
        },
        {
          title: 'Pick new dates and a flight',
          detail: 'Each option shows the total to pay, including the change fee and any fare difference.',
        },
        {
          title: 'Pay and get new e-tickets',
          detail:
            'New e-tickets arrive by email within a few minutes. Seats and bags move with you where the aircraft allows.',
        },
      ],
      tips: [
        'Changes close 3 hours before departure. After that, chat with us.',
        'If the new fare is cheaper, we refund the difference as Vela travel credit.',
        'Changing only one traveler splits the booking into two references.',
      ],
    },
  },
  {
    id: 'name-typo',
    topicId: 'bookings',
    question: 'Can I correct a typo in a traveler’s name?',
    answer:
      'Corrections of up to 3 letters are free within 24 hours of booking. After that, or for bigger changes, contact us — airlines usually treat them as a new ticket.',
  },
  {
    id: 'cancel-24h',
    topicId: 'bookings',
    question: 'Can I cancel for free right after booking?',
    answer:
      'Yes. If you booked at least 7 days before departure, you can cancel within 24 hours of purchase for a full refund on any fare.',
    link: MANAGE_BOOKING,
  },
  {
    id: 'schedule-change',
    topicId: 'bookings',
    question: 'What if the airline changes my schedule?',
    answer:
      'If your departure moves by more than 3 hours you can accept it, choose another flight at no cost, or take a full refund. We’ll email you and show the options in Manage booking.',
  },
  {
    id: 'refund-time',
    topicId: 'payments',
    question: 'When will I get my refund?',
    answer:
      'Approved refunds go back to your original payment method within 7–14 business days, depending on your bank. Vela travel credit arrives instantly.',
    link: { label: 'Track a refund', to: `${paths.help}#refund` },
    details: {
      updatedOn: '5 Oct 2026',
      readingMinutes: 2,
      helpfulNote: '962 travelers found this helpful',
      table: {
        title: 'How long it takes',
        rows: [
          { label: 'Vela travel credit', value: 'Instantly', note: 'Shows in Payment methods' },
          { label: 'Credit or debit card', value: '7–14 business days', note: 'Depends on your bank' },
          { label: 'E-wallet', value: '3–5 business days', note: 'Back to the linked wallet' },
        ],
      },
      steps: [
        {
          title: 'Request the refund',
          detail: 'Cancel in Manage booking. We confirm by email straight away.',
        },
        { title: 'We approve it', detail: 'Usually within 24 hours, following the fare rules.' },
        { title: 'We send it', detail: 'The money leaves us. You’ll get an email with the amount.' },
        { title: 'Your bank posts it', detail: 'Track it any time with your booking reference.' },
      ],
      tips: [
        'Taxes are always refunded, even on Saver fares.',
        'Card refunds can show as a credit on your next statement.',
      ],
    },
  },
  {
    id: 'payment-methods',
    topicId: 'payments',
    question: 'Which payment methods can I use?',
    answer:
      'Credit and debit cards, e-wallets and online banking. All prices are in Philippine pesos with taxes and fees included.',
    link: { label: 'Payment methods', to: paths.account.paymentMethods },
  },
  {
    id: 'card-declined',
    topicId: 'payments',
    question: 'Why was my card declined?',
    answer:
      'Most declines come from your bank’s security checks. Approve the payment in your banking app and try again, or use another method. We hold your fare for 20 minutes while you sort it out.',
  },
  {
    id: 'travel-credit',
    topicId: 'payments',
    question: 'How does Vela travel credit work?',
    answer:
      'Credit applies automatically at checkout and can pay for flights, seats and bags for anyone you book for. Each credit shows its expiry date in Payment methods.',
    link: { label: 'See my credit', to: paths.account.paymentMethods },
  },
  {
    id: 'company-receipt',
    topicId: 'payments',
    question: 'Can I get an official receipt with my company’s details?',
    answer:
      'Yes. Turn on company name and TIN in Payment methods before you book, or download an updated receipt for a past trip from My trips.',
    link: { label: 'Get a receipt', to: paths.trips },
  },
  {
    id: 'baggage-allowance',
    topicId: 'baggage',
    question: 'How much baggage is included?',
    answer:
      'Every fare includes a personal item and a 7 kg carry-on. Classic adds one 23 kg checked bag and Flex adds two. Your exact allowance is shown on your booking.',
    details: {
      updatedOn: '20 Sep 2026',
      readingMinutes: 2,
      helpfulNote: '2,031 travelers found this helpful',
      table: {
        title: 'Included with each fare',
        rows: [
          { label: 'Saver', value: '7 kg carry-on', note: 'Plus one personal item' },
          { label: 'Classic', value: '7 kg + 1 × 23 kg', note: 'One checked bag' },
          { label: 'Flex', value: '7 kg + 2 × 23 kg', note: 'Two checked bags' },
        ],
      },
      tips: [
        'Each checked bag can be up to 158 cm (length + width + height).',
        'Buying bags online costs less than paying at the airport.',
      ],
    },
  },
  {
    id: 'add-bags',
    topicId: 'baggage',
    question: 'Can I add bags after booking?',
    answer:
      'Yes, from Manage booking up to 3 hours before departure. It costs less than paying at the airport.',
    link: { label: 'Add bags', to: paths.trips },
  },
  {
    id: 'special-items',
    topicId: 'baggage',
    question: 'Can I bring a stroller, golf bag or surfboard?',
    answer:
      'Strollers and car seats travel free for children. Golf bags and surfboards up to 23 kg count as one checked bag; anything heavier needs a sports equipment add-on.',
  },
  {
    id: 'lost-bag',
    topicId: 'baggage',
    question: 'My bag is delayed or damaged',
    answer:
      'Report it at the airline’s baggage desk before leaving the airport and keep the report number. Send it to us and we’ll follow up with the airline. With Vela Protect you can also claim for essentials.',
  },
  {
    id: 'check-in-opens',
    topicId: 'checkin',
    question: 'When does online check-in open?',
    answer:
      'Check-in opens 48 hours before departure and closes 60 minutes before international flights. Boarding passes go to your app and email.',
    link: { label: 'Check in', to: paths.trips },
    details: {
      updatedOn: '1 Oct 2026',
      readingMinutes: 2,
      helpfulNote: '1,507 travelers found this helpful',
      steps: [
        { title: 'Open My trips', detail: 'Check in appears on the trip 48 hours before departure.' },
        {
          title: 'Confirm your documents',
          detail: 'Check your passport details and accept the restricted items declaration.',
        },
        { title: 'Get your boarding pass', detail: 'Add it to your phone’s wallet or download a PDF.' },
      ],
      tips: [
        'Bag drop closes 60 minutes before international flights.',
        'If you can’t check in online, airport counters open 3 hours before departure.',
      ],
    },
  },
  {
    id: 'print-pass',
    topicId: 'checkin',
    question: 'Do I need to print my boarding pass?',
    answer:
      'Usually not — mobile boarding passes are accepted at most airports. If a route needs a printed pass, we’ll tell you at check-in.',
  },
  {
    id: 'seat-after-check-in',
    topicId: 'checkin',
    question: 'Can I change my seat after checking in?',
    answer:
      'Yes, until 60 minutes before departure. Open your boarding pass and choose Change seat — your pass updates straight away.',
    link: { label: 'Open my boarding pass', to: paths.trips },
  },
  {
    id: 'cant-check-in',
    topicId: 'checkin',
    question: 'Why can’t I check in online?',
    answer:
      'Some trips need a document check at the airport, for example when travelling with an infant or on a one-way ticket abroad. Airport counters open 3 hours before departure.',
  },
  {
    id: 'visa',
    topicId: 'documents',
    question: 'Do I need a visa?',
    answer:
      'It depends on your nationality and destination. We show a reminder on your confirmation, but always check the official entry requirements of the country you’re visiting.',
  },
  {
    id: 'passport-validity',
    topicId: 'documents',
    question: 'How long must my passport be valid?',
    answer:
      'Some destinations, like Singapore, require at least 6 months’ validity on arrival, and many airlines apply the same rule. We check this when you enter passport details.',
    link: { label: 'Check saved passports', to: paths.account.travelers },
    details: {
      updatedOn: '24 Sep 2026',
      readingMinutes: 2,
      helpfulNote: '744 travelers found this helpful',
      table: {
        title: 'Common destinations from Manila',
        rows: [
          { label: 'Singapore', value: '6 months', note: 'From the day you arrive' },
          { label: 'Japan', value: 'Whole stay', note: 'Visa usually needed' },
          { label: 'South Korea', value: '6 months', note: 'Recommended by airlines' },
        ],
      },
      tips: ['Renewals can take several weeks, so check expiry dates when you book.'],
    },
  },
  {
    id: 'children-documents',
    topicId: 'documents',
    question: 'What documents do children need?',
    answer:
      'Every child needs their own passport. Minors leaving the Philippines without both parents may also need a travel clearance, so check before you book.',
  },
  {
    id: 'name-mismatch',
    topicId: 'documents',
    question: 'My passport name doesn’t match my booking',
    answer:
      'Names must match the passport exactly. Small typos can be fixed for free within 24 hours of booking; after that, contact us before check-in.',
  },
  {
    id: 'delete-account',
    topicId: 'account',
    question: 'How do I delete my account?',
    answer:
      'Go to Account settings and open Privacy and data. Upcoming bookings stay valid, and we keep invoices for as long as the law requires.',
    link: { label: 'Account settings', to: `${paths.account.settings}#privacy` },
    details: {
      updatedOn: '15 Sep 2026',
      readingMinutes: 2,
      helpfulNote: '388 travelers found this helpful',
      steps: [
        { title: 'Open Account settings', detail: 'Sign in and go to Privacy and data.' },
        {
          title: 'Choose Delete account',
          detail: 'If you have upcoming trips, we’ll ask you to finish or cancel them first.',
        },
        {
          title: 'Confirm',
          detail: 'We delete your profile after 14 days. Sign in before then to change your mind.',
        },
      ],
      tips: ['Travel credit can’t be refunded once your account is deleted.'],
    },
  },
  {
    id: 'missing-code',
    topicId: 'account',
    question: 'I didn’t get my verification code',
    answer:
      'Check your spam folder and give it up to 2 minutes. You can request a new code after 45 seconds.',
  },
  {
    id: 'forgot-password',
    topicId: 'account',
    question: 'I forgot my password',
    answer:
      'Choose Forgot password on the sign-in page and we’ll email a link to choose a new one. The link works for 30 minutes.',
    link: { label: 'Reset my password', to: `${paths.signIn}#reset` },
  },
  {
    id: 'family-bookings',
    topicId: 'account',
    question: 'Can I manage bookings for my family?',
    answer:
      'Yes. Save your family as travelers and book for them from your account. Anyone on a booking can also manage it with the reference and their last name.',
    link: { label: 'Saved travelers', to: paths.account.travelers },
  },
];

export const POPULAR_ARTICLE_IDS: ReadonlyArray<{ label: string; articleId: string }> = [
  { label: 'Refund status', articleId: 'refund-time' },
  { label: 'Change my flight', articleId: 'change-flight' },
  { label: 'Baggage allowance', articleId: 'baggage-allowance' },
  { label: 'Passport validity', articleId: 'passport-validity' },
];

export const TRAVEL_ADVISORY: TravelAdvisory = {
  title: 'Travel advisory · Tropical storm over Northern Luzon',
  detail:
    'Flights to and from Laoag and Tuguegarao on 9–10 Oct may be retimed. Affected travelers can change dates for free until 17 Oct.',
  action: { label: 'Check my booking', to: paths.findBooking },
};

export const TRACKED_REFUNDS: Record<string, RefundStatus & { lastName: string }> = {
  VL0PLW: {
    reference: 'VL0PLW',
    lastName: 'ong',
    summary: 'Singapore → Manila · 2 travelers',
    amount: 16480,
    statusLabel: 'On its way to your bank',
    steps: [
      { title: 'Refund requested', detail: 'Fri, 2 Oct · cancelled online', isDone: true },
      { title: 'Approved', detail: 'Sat, 3 Oct · within fare rules', isDone: true },
      { title: 'Sent to your bank', detail: 'Mon, 5 Oct · card ending 7702', isDone: true },
      { title: 'In your account', detail: 'Expected by Mon, 19 Oct', isDone: false },
    ],
  },
};

export const CALLBACK_SLOTS: readonly CallbackSlot[] = [
  { id: 'today-1430', dayLabel: 'Today', time: '14:30' },
  { id: 'today-1600', dayLabel: 'Today', time: '16:00' },
  { id: 'today-1800', dayLabel: 'Today', time: '18:00' },
  { id: 'sat-0900', dayLabel: 'Sat 10 Oct', time: '09:00' },
  { id: 'sat-1100', dayLabel: 'Sat 10 Oct', time: '11:00' },
  { id: 'sat-1400', dayLabel: 'Sat 10 Oct', time: '14:00' },
];

/** Quick replies offered in chat, with the agent's canned answers for the demo. */
export const CHAT_QUICK_REPLIES: Readonly<Record<string, string>> = {
  'Where’s my refund?':
    'I can see VL0PLW — ₱16,480 left us on 5 Oct and should reach your card by 19 Oct. Anything else?',
  'Add a bag':
    'Sure. Which booking is it for? You can also add bags yourself in Manage booking in about a minute.',
  'Change my flight':
    'Happy to help. Share your booking reference and the new date you have in mind, and I’ll check prices.',
};

export const CHAT_AGENT = {
  name: 'Ramon',
  initials: 'RD',
  greeting: 'Hi, I’m Ramon. How can I help with your trip today?',
};
