import { paths } from '@/app/paths';

export type SiteSection = 'flights' | 'trips' | 'help' | null;

export const PRIMARY_NAV: ReadonlyArray<{ section: Exclude<SiteSection, null>; label: string; to: string }> =
  [
    { section: 'flights', label: 'Flights', to: paths.home },
    { section: 'trips', label: 'My trips', to: paths.trips },
    { section: 'help', label: 'Help', to: paths.help },
  ];

/** Which primary section a URL belongs to, so the header can mark it as current. */
export function sectionForPath(pathname: string): SiteSection {
  if (pathname === paths.home || pathname.startsWith(paths.flights)) return 'flights';
  const tripPrefixes = [paths.trips, '/account', '/booking', paths.signOut];
  if (tripPrefixes.some((prefix) => pathname.startsWith(prefix))) return 'trips';
  if (pathname.startsWith(paths.help)) return 'help';
  return null;
}
