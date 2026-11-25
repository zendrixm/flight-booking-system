import type { OpenRole, PressAsset } from '@/types/company';

export const OPEN_ROLES: readonly OpenRole[] = [
  {
    id: 'senior-product-designer',
    title: 'Senior product designer',
    team: 'Design',
    location: 'Makati City · hybrid',
  },
  {
    id: 'android-engineer',
    title: 'Android engineer',
    team: 'Engineering',
    location: 'Makati City or remote (PH)',
  },
  {
    id: 'travel-specialist-night',
    title: 'Travel specialist, night shift',
    team: 'Customer care',
    location: 'Cebu City · on-site',
  },
  {
    id: 'airline-partnerships-manager',
    title: 'Airline partnerships manager',
    team: 'Commercial',
    location: 'Singapore',
  },
];

export const PRESS_ASSETS: readonly PressAsset[] = [
  {
    id: 'logos',
    name: 'Logo pack',
    description: 'SVG and PNG · light and dark · 2.1 MB',
    fileName: 'vela-logo-pack.zip',
  },
  {
    id: 'screenshots',
    name: 'Product screenshots',
    description: '12 images · 1x and 2x · 18 MB',
    fileName: 'vela-product-screenshots.zip',
  },
  {
    id: 'facts',
    name: 'Company fact sheet',
    description: 'PDF · 2 pages · updated Oct 2026',
    fileName: 'vela-fact-sheet.pdf',
  },
  {
    id: 'bios',
    name: 'Founder bios and photos',
    description: 'PDF and JPG · 6.4 MB',
    fileName: 'vela-founders.zip',
  },
];

export const PRESS_EMAIL = 'press@vela.travel';
