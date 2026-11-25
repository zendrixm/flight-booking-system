import { useEffect, useId, useRef, useState } from 'react';

import { PageLoader } from '@/components/layout';
import { Alert, Button, EmptyState, Tabs, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { formatPeso } from '@/lib/format';
import {
  assignRefundToMe,
  decideRefund,
  getRefundQueue,
  undoRefundDecision,
} from '@/services/console/refundsService';
import { ApiError } from '@/services/mockApi';
import type {
  RefundDecisionRequest,
  RefundQueue,
  RefundQueueResult,
  RefundRequestStatus,
} from '@/types/console/refund';

import { ConsolePage } from '../../shared/components/ConsolePage';
import { RefundMetrics } from '../components/RefundMetrics';
import { RefundRequestsTable } from '../components/RefundRequestsTable';
import { RefundReviewPanel } from '../components/RefundReviewPanel';
import { useRefundQueueQuery } from '../hooks/useRefundQueueQuery';
import { nextPendingRequest, REFUND_TABS } from '../lib/refundReview';
import styles from './RefundsPage.module.css';

const PAGE_TITLE = 'Refunds';
/** Below this width the panel sits under the table, so picking a request scrolls to it. */
const STACKED_LAYOUT_QUERY = '(max-width: 1099px)';

export function RefundsPage() {
  const queue = useAsyncData('refund-queue', getRefundQueue);

  if (!queue.data) {
    if (queue.status !== 'error') return <PageLoader label="Loading refunds…" />;
    return (
      <ConsolePage section="refunds" title={PAGE_TITLE}>
        <Alert
          tone="danger"
          role="alert"
          title="Refund requests didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={queue.reload}>
              Try again
            </Button>
          }
        />
      </ConsolePage>
    );
  }
  return <RefundsBoard queue={queue.data} onQueueChange={queue.mutate} />;
}

interface RefundsBoardProps {
  queue: RefundQueue;
  onQueueChange: (queue: RefundQueue) => void;
}

function RefundsBoard({ queue, onQueueChange }: RefundsBoardProps) {
  const toast = useToast();
  const query = useRefundQueueQuery();
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [isPanelHighlighted, setIsPanelHighlighted] = useState(false);
  const [revealCount, setRevealCount] = useState(0);

  const { requests } = queue;
  const linked = requests.find((request) => request.bookingReference === query.requestReference);
  const tab = query.tab ?? linked?.status ?? 'pending';
  const tabRequests = requests.filter((request) => request.status === tab);
  // A request stays in the panel after its decision moves it to another tab, until something else is picked.
  const selected = linked ?? tabRequests[0];
  const nextPending = selected && tab === 'pending' ? nextPendingRequest(requests, selected) : undefined;

  const changeTab = (next: RefundRequestStatus) => {
    const keep = selected?.status === next ? selected : requests.find((request) => request.status === next);
    query.update({ tab: next, request: keep?.bookingReference ?? null });
  };

  const select = (reference: string) => {
    setIsPanelHighlighted(true);
    setRevealCount((count) => count + 1);
    query.update({ tab, request: reference });
  };

  // When the panel sits below the table, bring the picked request into view.
  useEffect(() => {
    if (revealCount === 0 || !window.matchMedia(STACKED_LAYOUT_QUERY).matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [revealCount]);

  /** Runs a change, then shows the fresh queue and its message. */
  const commit = async (change: () => Promise<RefundQueueResult>) => {
    try {
      const result = await change();
      onQueueChange(result.queue);
      toast.show({ tone: 'success', message: result.message });
    } catch (error) {
      toast.show({
        tone: 'error',
        message:
          error instanceof ApiError
            ? error.message
            : 'That didn’t go through. Check your connection and try again.',
      });
    }
  };

  const decide = (reference: string, decision: RefundDecisionRequest) =>
    commit(() => decideRefund(reference, decision));

  return (
    <ConsolePage
      section="refunds"
      title={PAGE_TITLE}
      description={`Review customer requests against fare rules. Service target: a decision within 48 hours. Your approval limit is ${formatPeso(queue.approvalLimit)} per refund.`}
    >
      <RefundMetrics metrics={queue.metrics} />

      <Tabs<RefundRequestStatus>
        label="Refund status"
        items={REFUND_TABS.map((item) => ({
          ...item,
          count: requests.filter((request) => request.status === item.id).length,
        }))}
        value={tab}
        onChange={changeTab}
      >
        <div className={styles.layout}>
          <section aria-label="Refund requests" className={styles.tableCard}>
            {tabRequests.length > 0 ? (
              <RefundRequestsTable
                requests={tabRequests}
                isPendingView={tab === 'pending'}
                selectedReference={selected?.bookingReference}
                panelId={panelId}
                onSelect={select}
              />
            ) : (
              <EmptyState
                variant="plain"
                icon={tab === 'pending' ? 'checkCircle' : 'receipt'}
                title={tab === 'pending' ? 'Queue cleared' : 'Nothing here yet'}
                description={
                  tab === 'pending'
                    ? 'Every request has a decision. New requests land here as customers submit them, oldest first.'
                    : 'Decided requests for this status show up here for 30 days.'
                }
                actions={
                  <Button
                    variant="quiet"
                    onClick={() => changeTab(tab === 'pending' ? 'approved' : 'pending')}
                  >
                    {tab === 'pending' ? 'See approved refunds' : 'Back to pending review'}
                  </Button>
                }
              />
            )}
          </section>

          {selected && tabRequests.length > 0 && (
            <RefundReviewPanel
              // Fresh amount and note for each request.
              key={selected.bookingReference}
              id={panelId}
              ref={panelRef}
              request={selected}
              limits={queue}
              nextPending={nextPending}
              isHighlighted={isPanelHighlighted}
              onHighlightEnd={() => setIsPanelHighlighted(false)}
              onAssignToMe={() => commit(() => assignRefundToMe(selected.bookingReference))}
              onDecide={(decision) => decide(selected.bookingReference, decision)}
              onUndo={() => commit(() => undoRefundDecision(selected.bookingReference))}
              onReviewNext={select}
            />
          )}
        </div>
      </Tabs>
    </ConsolePage>
  );
}
