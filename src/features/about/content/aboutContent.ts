import { paths } from '@/app/paths';
import type { IconName } from '@/components/icons';

/** Marketing copy for the About page. Kept out of the components so it can move to a CMS later. */

export const COMPANY_STATS = [
  { value: '120+', label: 'Airlines compared', detail: 'Full-service and low-cost, in one search' },
  { value: '2.4M', label: 'Travelers since 2019', detail: 'Mostly families heading home or away' },
  { value: '4.8', label: 'Support rating', detail: 'Average of 61,000 reviewed conversations' },
  { value: '24/7', label: 'Real people', detail: 'In English and Filipino, every day of the year' },
] as const;

export interface CompanyPromise {
  title: string;
  body: string;
  icon: IconName;
  linkLabel: string;
  linkTo: string;
}

export const PROMISES: readonly CompanyPromise[] = [
  {
    title: 'The whole price, first time',
    body: 'Every fare includes taxes and carrier fees. If the total at checkout is ever higher than the price you clicked, we refund the difference.',
    icon: 'cash',
    linkLabel: 'How our prices work',
    linkTo: `${paths.legal('carriage')}#fares`,
  },
  {
    title: 'Real people, any hour',
    body: 'Travel specialists in Manila and Cebu answer chat and calls around the clock. No phone trees, no bots pretending to be people.',
    icon: 'messageSquare',
    linkLabel: 'Visit the Help centre',
    linkTo: paths.help,
  },
  {
    title: 'Your data, your call',
    body: 'We share traveler details only with the airline and the authorities that need them, and you can download or delete everything in a few clicks.',
    icon: 'shield',
    linkLabel: 'Read our privacy notice',
    linkTo: paths.legal('privacy'),
  },
];

export const TIMELINE = [
  {
    year: '2019',
    title: 'Founded in Makati',
    body: 'Three friends, one spreadsheet of hidden fees and a search that showed totals first.',
  },
  {
    year: '2021',
    title: 'Price alerts',
    body: 'Travelers asked when to book. We started watching fares for them — 300,000 alerts in the first year.',
  },
  {
    year: '2023',
    title: 'One million travelers',
    body: 'Opened our Cebu support hub and started answering in Filipino around the clock.',
  },
  {
    year: '2025',
    title: 'Singapore office',
    body: 'Partnerships with more airlines across Southeast Asia, Japan and Korea.',
  },
  {
    year: '2026',
    title: 'Travel credit that grows',
    body: 'Refunds as Vela credit arrive instantly and are worth 10% more.',
  },
] as const;

export const OFFICES = [
  {
    kind: 'Headquarters',
    city: 'Manila',
    address: '88 Rizal Avenue, Makati City 1200, Philippines',
    team: 'Product, engineering, design and finance · 110 people',
  },
  {
    kind: 'Support hub',
    city: 'Cebu',
    address: 'IT Park, Lahug, Cebu City 6000, Philippines',
    team: 'Travel specialists, 24/7 · 55 people',
  },
  {
    kind: 'Partnerships',
    city: 'Singapore',
    address: '1 Raffles Place, Singapore 048616',
    team: 'Airline and hotel partnerships · 15 people',
  },
] as const;
