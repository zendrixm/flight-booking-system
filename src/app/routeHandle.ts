import { useMatches } from 'react-router';

/** Per-route options read by layouts. Set them with a route's `handle`. */
export interface RouteHandle {
  /** Hide the site footer, e.g. on task-focused pages such as Manage booking. */
  hideFooter?: boolean;
}

/** Merges the `handle` of every matched route, deepest last. */
export function useRouteHandle(): RouteHandle {
  return useMatches().reduce<RouteHandle>(
    (merged, match) => ({ ...merged, ...(match.handle as RouteHandle) }),
    {},
  );
}
