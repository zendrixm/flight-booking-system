import { useSearchParams } from 'react-router';

import { filtersFromParams, filtersToParams, type DestinationFilters } from '../lib/destinationFilters';

/**
 * Region, sort and budget live in the URL (`?region=eastAsia&sort=time&under=10000`), so a filtered
 * list can be shared and survives a reload.
 */
export function useDestinationFilters(): [DestinationFilters, (patch: Partial<DestinationFilters>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);

  const updateFilters = (patch: Partial<DestinationFilters>) =>
    setSearchParams(filtersToParams({ ...filters, ...patch }, searchParams), {
      replace: true,
      preventScrollReset: true,
    });

  return [filters, updateFilters];
}
