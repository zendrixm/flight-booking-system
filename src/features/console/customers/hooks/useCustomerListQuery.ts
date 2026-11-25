import { setOrDelete, useUrlQuery } from '@/hooks';
import type { CustomerSegment } from '@/types/console/customer';

import { segmentFromParam } from '../lib/customerPresentation';

/**
 * Segment, search and the open customer live in the URL, so links like
 * `/console/customers?customer=andrea` open the drawer and a filtered list can be shared.
 */
export function useCustomerListQuery() {
  const [searchParams, updateQuery] = useUrlQuery();
  const segment = segmentFromParam(searchParams.get('segment'));
  const search = searchParams.get('q') ?? '';
  const openCustomerId = searchParams.get('customer');

  const update = (patch: { segment?: CustomerSegment; search?: string; customer?: string | null }) =>
    updateQuery((params) => {
      if (patch.segment !== undefined) setOrDelete(params, 'segment', patch.segment, 'all');
      if (patch.search !== undefined) setOrDelete(params, 'q', patch.search);
      if (patch.customer !== undefined) setOrDelete(params, 'customer', patch.customer);
    });

  return { segment, search, openCustomerId, update };
}
