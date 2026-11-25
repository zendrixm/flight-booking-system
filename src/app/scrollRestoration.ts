import type { GetScrollRestorationKeyFunction } from 'react-router';

/**
 * React Router gives the first history entry of every page load the key "default", so a fresh
 * load of a new URL would restore the position the previous load in this tab saved (and skip
 * scrolling to its #hash). Keying those entries by URL keeps each page's position its own.
 */
export const scrollRestorationKey: GetScrollRestorationKeyFunction = (location) =>
  location.key === 'default' ? `${location.pathname}${location.search}` : location.key;
