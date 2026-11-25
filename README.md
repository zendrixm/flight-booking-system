# Vela web

Vela is a flight-booking product in three surfaces that share one design system:

| Surface                | Starts at        | What it covers                                                                                                                                                                                |
| ---------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer site**      | `/`              | Search, results, checkout (travelers, seats, extras, payment), confirmation, trips, manage booking, check-in and boarding pass, account, sign-in, help, destinations, company and legal pages |
| **Phone app**          | `/app`           | Search, trips, price alerts and account tabs, full-screen results and boarding pass, built as a phone-width web app                                                                           |
| **Vela Console**       | `/console`       | The back office: dashboard, bookings and booking detail, flight operations, refunds, pricing and promotions, customers, users and roles, settings                                             |
| **Design foundations** | `/design-system` | The living style guide: palette, type scale, component states and layout tokens, drawn with the real kit                                                                                      |

It is a front end only. Every screen talks to async **services** backed by in-memory mock data, so it runs
without a server and a real API can be dropped in later (see [Replacing the mock API](#replacing-the-mock-api)).

## Getting started

Requires **Node.js 20.19 or later**.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script                            | What it does                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                     | Vite dev server with hot reload                                   |
| `npm run build`                   | Type-checks, then builds to `dist/`                               |
| `npm run preview`                 | Serves the production build                                       |
| `npm run typecheck`               | `tsc -b` across the app and config                                |
| `npm run lint`                    | ESLint (TypeScript, React Hooks, jsx-a11y)                        |
| `npm run format` / `format:check` | Prettier                                                          |
| `npm test` / `test:watch`         | Vitest unit tests                                                 |
| `npm run check`                   | Everything CI should run: typecheck, lint, format check and tests |

Copy `.env.example` to `.env` to change the simulated network latency (`VITE_MOCK_LATENCY_MS`, default 400 ms;
`0` turns it off).

## Demo rules

The data tells one consistent story, pinned to **Friday 9 October 2026, 00:58 in Manila** (`src/config/demo.ts`),
so dates, countdowns and "check-in opens" messages never drift.

- **Customer site and phone app** start signed in as Andrea Lim Reyes. Sign out and back in from the account menu.
  Her Singapore trip (`VL3MZ8`) departs tomorrow and is checked in; Tokyo (`VL7Q2K`) is next month.
- **Vela Console** starts signed in as Lea Navarro (Operations manager). To try the sign-in page, sign out, then
  use any `@vela.travel` email with a password of 8+ characters and any 6-digit code except `123456`, `482107`
  or a repeated digit. Five wrong passwords or three wrong codes lock the account, as in production.
- Changes are kept in memory and reset on reload, except a few per-browser conveniences (session, cookie choices,
  checkout progress, phone recent searches) kept in Web Storage.

## Project structure

```
src/
  app/              App shell: router, route paths, providers (session, staff session, preferences, toasts)
  components/
    ui/             The design-system kit: Button, TextField, Dialog, Sheet, Drawer, Table, Tabs, Toast…
                    One folder per component: Name.tsx, Name.module.css, index.ts
    flight/         Flight-domain building blocks shared by features (AirlineMark, Barcode, BoardingPassCard…)
    booking/        Booking dialogs shared by the customer site and the console (receipt, email itinerary)
    icons/          The single icon set (Icon + iconPaths) and the Vela mark
    layout/         PageContainer, PageLoader
  config/           Demo constants (the pinned "today", booking horizon, traveler limits)
  data/             Static reference data: airports, airlines, travel options, seat map
  features/         One folder per product area, each with:
    <area>/
      pages/        Route components (lazy-loaded)
      components/   Components used only by this area
      lib/          Pure logic: form state, validation, labels — unit-tested
      hooks/        Area-specific hooks (e.g. URL-driven view state)
      state/        Stores that outlive a page (checkout, phone search)
    console/<area>/ The back office follows the same shape per section, plus console/shared
    phone/          The phone app: search, trips, alerts, account, results, boarding-pass, shared
  hooks/            Cross-cutting hooks: useAsyncData, useUrlQuery, useFocusTrap, useEscapeKey…
  layouts/          App chrome per surface: site header and footer, console shell, phone tabs
                    (the account and checkout layouts live with their features)
  lib/              Framework-free helpers: dates, money, validation, URL ↔ search, storage, store
  mocks/            Fixtures behind the services (console fixtures in mocks/console)
  services/         Async API facades (`mockRequest`); console services and shared rules in services/console
  styles/           tokens.css (the design tokens) and base.css (reset and element defaults)
  types/            Domain types, mirroring what an API would return
```

## Conventions

**Naming.** Components and their files are `PascalCase` (`PhoneFlightCard.tsx`); hooks are `useX`; everything else is
`camelCase`, with `UPPER_SNAKE_CASE` for module constants. CSS Module classes are `camelCase`. URLs are kebab-case
and live in `app/paths.ts` — never hard-code a path in a component. Props interfaces are named `XProps`.

**Components.** Named exports only; one component per file, except tiny private helpers. Pages are lazy-loaded
through `lazyPage()` in the router. Build from the kit in `components/ui` before writing a new control; if a pattern
repeats across features, it belongs in the kit.

**Styling.** CSS Modules plus the tokens in `styles/tokens.css`: five colours, every other shade is one of them at a
documented opacity. No inline styles except for genuinely dynamic values (passed as CSS custom properties where
possible). The single spacing rule is `--gap` (24px; 16px in the phone app via `data-platform="phone"`); the
console uses `data-density="compact"` for 40px controls.

**Data.** Components never import mocks. They call services, which return promises and throw `ApiError(code,
message)`. Pages load data with `useAsyncData(key, loader)`; mutations resolve with the updated record and a message
(`{ data, message }`), which the page applies with `mutate()` and announces with a toast.

**State.** View state that should survive a reload or be linkable (tabs, filters, the open record) lives in the URL
through `useUrlQuery`. State that spans routes (checkout, the phone search form) lives in a small store built with
`lib/createStore`. Everything else is local component state.

**Forms.** Validation is pure functions in the feature's `lib/` (or `services/console/*Rules.ts` when the server
enforces the same rule), so the form and the "server" can never disagree. Errors appear after the first submit
attempt, except where the design validates live. Required fields carry a Garnet asterisk and `aria-required`.

**Sharing between features.** A feature may import another feature's `lib/` or `state/` (the phone app reuses the
website's search, results and price-alert logic), but never its components. Anything two features render belongs in
`components/`.

**Accessibility.** Every interactive element is reachable by keyboard with a visible focus ring; dialogs, drawers and
sheets trap focus and close on Escape (one layer at a time); icon buttons have labels; status is never colour alone.
`eslint-plugin-jsx-a11y` runs in lint.

**Imports.** Ordered in groups: packages, `@/` aliases, then relative imports, each group sorted. Use `import type`
for types (enforced by ESLint).

## Replacing the mock API

Each file in `src/services` is the only place its data comes from. To connect a real backend, keep the function
signatures and replace each body's `mockRequest(() => …)` with a `fetch` (or your API client), mapping errors to
`ApiError`. `useAsyncData` is deliberately small; swap it for TanStack Query when caching and background refetching
are needed.

## Testing

Unit tests sit next to the code they cover (`*.test.ts`) and focus on the logic that carries business rules: dates and
money formatting, validators, the search reducer, results filtering and sorting, price-alert rules, and the console's
flight-ops, refund, pricing, customer, team and settings rules.

```bash
npm test
```

Vitest runs in jsdom with Testing Library and `jest-dom` set up in `src/test/setup.ts`, ready for component tests.

## How this export was verified

The project was produced in a sandbox without access to the npm registry, so `node_modules` and a lockfile are not
included — `npm install` creates them. Before delivery the code was checked with the same tools the scripts use:
TypeScript in strict mode (no errors), a full production bundle, the unit tests, and scripted browser walkthroughs of
every flow at 1440px and 390px with no horizontal overflow. Run `npm run check` once after installing to confirm the
same on your machine.
