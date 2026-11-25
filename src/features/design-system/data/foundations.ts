/**
 * The content of the design-system page. Values mirror styles/tokens.css; the page renders the
 * swatches and samples from the live tokens, so a token change shows up here straight away.
 */

export interface PaletteColor {
  name: 'Midnight' | 'Porcelain' | 'Brass' | 'Spruce' | 'Garnet';
  hex: string;
  /** The `--rgb-*` token holding the colour's channels. */
  rgbToken: string;
  role: string;
  contrast: string;
  /** Colour of the "Aa" sample drawn on the swatch. */
  onColor: 'midnight' | 'porcelain';
}

export const PALETTE: readonly PaletteColor[] = [
  {
    name: 'Midnight',
    hex: '#0E1B2C',
    rgbToken: '--rgb-midnight',
    role: 'Text, primary actions, dark surfaces, focus ring',
    contrast: '16.5:1 on Porcelain',
    onColor: 'porcelain',
  },
  {
    name: 'Porcelain',
    hex: '#F9F9F6',
    rgbToken: '--rgb-porcelain',
    role: 'Page and card surfaces, text on Midnight',
    contrast: '16.5:1 under Midnight text',
    onColor: 'midnight',
  },
  {
    name: 'Brass',
    hex: '#A8844E',
    rgbToken: '--rgb-brass',
    role: 'Selection, highlights, attention, the mark',
    contrast: '5.0:1 with Midnight · 3.3:1 on Porcelain (UI only)',
    onColor: 'midnight',
  },
  {
    name: 'Spruce',
    hex: '#2F6A57',
    rgbToken: '--rgb-spruce',
    role: 'Confirmed, on time, included, savings',
    contrast: '6.0:1 on Porcelain',
    onColor: 'porcelain',
  },
  {
    name: 'Garnet',
    hex: '#A23B3F',
    rgbToken: '--rgb-garnet',
    role: 'Errors, cancellations, destructive actions',
    contrast: '6.1:1 on Porcelain',
    onColor: 'porcelain',
  },
];

/** The opacity ladder every colour is used at. */
export const OPACITY_LADDER = [100, 72, 40, 12, 6, 4] as const;

export type OpacityExample =
  | 'primary'
  | 'secondary'
  | 'caption'
  | 'disabled'
  | 'outlined'
  | 'chip'
  | 'readOnly';

export const OPACITY_STEPS: ReadonlyArray<{
  step: string;
  use: string;
  example: OpacityExample;
  sample: string;
}> = [
  {
    step: '100%',
    use: 'Text, icons, primary fills, status color',
    example: 'primary',
    sample: 'Primary text',
  },
  {
    step: '72%',
    use: 'Secondary text and muted icons (6.7:1)',
    example: 'secondary',
    sample: 'Supporting copy',
  },
  {
    step: '60–68%',
    use: 'Captions, placeholders, labels (≥ 4.5:1)',
    example: 'caption',
    sample: 'Caption text',
  },
  {
    step: '40%',
    use: 'Disabled controls — the whole element fades',
    example: 'disabled',
    sample: 'Disabled',
  },
  {
    step: '12–16%',
    use: 'Borders, input outlines, tints behind Brass selections',
    example: 'outlined',
    sample: 'Outlined',
  },
  { step: '6–8%', use: 'Hover fills, dividers, chips', example: 'chip', sample: 'Neutral chip' },
  { step: '4%', use: 'Read-only fields and quiet panels', example: 'readOnly', sample: 'Read-only value' },
];

export type TypeStyle =
  | 'displayXl'
  | 'displayL'
  | 'displayM'
  | 'heading'
  | 'titleL'
  | 'titleM'
  | 'bodyL'
  | 'bodyM'
  | 'label'
  | 'numerals';

export const TYPE_SCALE: ReadonlyArray<{ style: TypeStyle; name: string; spec: string; sample: string }> = [
  { style: 'displayXl', name: 'Display XL', spec: 'Serif · 80 / 84 · −2%', sample: 'Every fare' },
  { style: 'displayL', name: 'Display L', spec: 'Serif · 56 / 60 · −1%', sample: 'Singapore' },
  { style: 'displayM', name: 'Display M', spec: 'Serif · 40 / 44', sample: 'Choose your seats' },
  { style: 'heading', name: 'Heading', spec: 'Serif · 28 / 32', sample: 'Your trip' },
  { style: 'titleL', name: 'Title L', spec: 'Sans · 20 / 28 · 600', sample: 'Contact details' },
  { style: 'titleM', name: 'Title M', spec: 'Sans · 16 / 24 · 600', sample: 'Bookings per day' },
  {
    style: 'bodyL',
    name: 'Body L',
    spec: 'Sans · 16 / 24 · 400',
    sample: 'Names must match each passport exactly.',
  },
  {
    style: 'bodyM',
    name: 'Body M',
    spec: 'Sans · 14 / 20 · 400',
    sample: 'Refunds above ₱50,000 need Finance approval.',
  },
  { style: 'label', name: 'Label', spec: 'Sans · 12 / 16 · 600 · +8% caps', sample: 'Depart · Thu, 12 Nov' },
  { style: 'numerals', name: 'Numerals', spec: 'Sans · tabular figures', sample: '₱39,862 · 08:40 → 13:55' },
];

export const BUTTON_KINDS = [
  { variant: 'primary', name: 'Primary', use: 'one per view, the main action' },
  { variant: 'secondary', name: 'Secondary', use: 'alternative actions next to a primary' },
  { variant: 'quiet', name: 'Quiet', use: 'tertiary and inline actions' },
  { variant: 'destructive', name: 'Destructive', use: 'delete, cancel trip, refund — always confirmed' },
] as const;

export const BUTTON_STATES = [
  {
    state: 'Default',
    spec: 'resting; hover shifts the fill 6–12% (opacity only); Tab shows a 2px Midnight ring, 2px offset',
  },
  { state: 'Loading', spec: 'label changes, spinner, input blocked' },
  { state: 'Disabled', spec: 'the whole button fades to 40%' },
] as const;

export const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

export const RADII: ReadonlyArray<{ value: string; preview: number; use: string }> = [
  { value: '8 px', preview: 8, use: 'Compact 32 px controls' },
  { value: '10–12 px', preview: 12, use: 'Fields, console buttons, nav items' },
  { value: '16 px', preview: 16, use: 'Cards, menus' },
  { value: '20–24 px', preview: 24, use: 'Panels, dialogs' },
  { value: '28 px', preview: 28, use: 'Boarding pass' },
  { value: '999 px', preview: 999, use: 'Pills, chips, badges' },
];

export const ELEVATIONS: ReadonlyArray<{ level: 0 | 1 | 2 | 3; name: string; use: string }> = [
  { level: 0, name: 'Level 0', use: 'Hairline only' },
  { level: 1, name: 'Level 1', use: 'Selected card' },
  { level: 2, name: 'Level 2', use: 'Popovers, search card' },
  { level: 3, name: 'Level 3', use: 'Dialogs, drawers' },
];

export const LAYOUT_RHYTHM: ReadonlyArray<{ spacing: string; site: string; console: string }> = [
  {
    spacing: 'Page padding',
    site: '24 px on every side · content max 1280 px',
    console: '24 px on every side',
  },
  { spacing: 'App bar → breadcrumb', site: '24 px', console: '24 px' },
  { spacing: 'Breadcrumb → title → subtitle', site: '8 px · 8 px', console: '8 px · 8 px' },
  { spacing: 'Between page sections', site: '24 px', console: '24 px' },
  { spacing: 'Between columns · sidebar ↔ content', site: '24 px', console: '24 px' },
  { spacing: 'Between cards and panels', site: '24 px', console: '24 px' },
  { spacing: 'Last section → footer', site: '24 px', console: '24 px' },
  {
    spacing: 'Card and dialog padding',
    site: '24 px',
    console: '24 px · table cards 0 with 24 px cell insets',
  },
  { spacing: 'Section heading → its content', site: '16 px', console: '16 px' },
  {
    spacing: 'Inside a card or dialog',
    site: '16 px between groups and between fields',
    console: '16 px between groups and between fields',
  },
  { spacing: 'Field label → field', site: '8 px', console: '8 px' },
  { spacing: 'Field height', site: '48 px', console: '40 px' },
];

export const PRINCIPLES: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Targets',
    body: '44 px minimum on the customer side and mobile; 40 px in the dense back office. Icon buttons always carry a label for screen readers.',
  },
  {
    title: 'Focus',
    body: 'A 2 px Midnight ring with a 2 px offset on every interactive element; Porcelain on dark surfaces.',
  },
  {
    title: 'Contrast',
    body: 'Body text ≥ 4.5:1, large text and UI boundaries ≥ 3:1. Brass is never used for small text on Porcelain.',
  },
  {
    title: 'Never color alone',
    body: 'Every status pairs color with a word, an icon or both, so it reads in grayscale and for color-blind users.',
  },
  {
    title: 'Alignment',
    body: 'Fields, dropdown triggers and the buttons beside them share one height in a row — 48 px on the customer site, 40 px in the console — and align on their bottom edge. Labels sit 8 px above, 13/600.',
  },
  {
    title: 'Required fields',
    body: 'A Garnet asterisk after the label marks every required field, with aria-required on the control. Optional fields carry no word or marker.',
  },
  {
    title: 'One gap',
    body: 'Every gap between components is 24 px — between cards, between columns, between sections, from the app bar and to the footer. Nothing gets a bigger gap on any side. The phone app applies the same single value at 16 px.',
  },
  {
    title: 'One navigation language',
    body: 'Sidebar items, header links and menus use the same steps: 72% at rest, 6% tint on hover, 10% tint + 600 + Brass icon when active. One count badge everywhere.',
  },
];
