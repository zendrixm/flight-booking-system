import { setOrDelete, useUrlQuery } from '@/hooks';
import type { RefundRequestStatus } from '@/types/console/refund';

import { tabFromParam } from '../lib/refundReview';

/**
 * The refunds tab and the request under review, in the URL so a link reopens the same request:
 * `?status=approved&request=VL6KWE`. Links from elsewhere carry only `?request=`, and the page
 * opens the tab that request is in.
 */
export function useRefundQueueQuery() {
  const [searchParams, updateQuery] = useUrlQuery();
  const tab = tabFromParam(searchParams.get('status'));
  const requestReference = searchParams.get('request')?.toUpperCase() ?? null;

  const update = (next: { tab: RefundRequestStatus; request: string | null }) =>
    updateQuery((params) => {
      // The tab is always written: a decision moves the request to another tab, and the view shouldn't follow it.
      params.set('status', next.tab);
      setOrDelete(params, 'request', next.request);
    });

  return { tab, requestReference, update };
}
