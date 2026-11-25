import { useState } from 'react';

import { Icon } from '@/components/icons';
import { PageLoader } from '@/components/layout';
import { Alert, Button, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import {
  createPromoCode,
  getPricing,
  publishFareRules,
  setPromoPaused,
  updatePromoCode,
} from '@/services/console/pricingService';
import { ApiError } from '@/services/mockApi';
import type {
  FareFamilyId,
  PricingOverview,
  PricingResult,
  PromoCode,
  PromoCodeDraft,
} from '@/types/console/pricing';

import { ConfirmDialog, type ConfirmDialogContent } from '../../shared/components/ConfirmDialog';
import { ConsolePage } from '../../shared/components/ConsolePage';
import { UnsavedChangesBar } from '../../shared/components/UnsavedChangesBar';
import { FareFamilyCard } from '../components/FareFamilyCard';
import { PromoCodeDrawer } from '../components/PromoCodeDrawer';
import { PromoCodesTable } from '../components/PromoCodesTable';
import {
  countErrors,
  draftsFrom,
  listChanges,
  rulesFromDrafts,
  type FareFamilyDraft,
} from '../lib/fareFamilyForm';
import { pauseConfirmContent } from '../lib/promoPresentation';
import styles from './PricingPage.module.css';

const PAGE_TITLE = 'Pricing & promotions';

type PendingConfirm = { kind: 'publish' } | { kind: 'discard' } | { kind: 'pause'; promo: PromoCode };
type PromoEditor = { mode: 'new' } | { mode: 'edit'; promo: PromoCode };

export function PricingPage() {
  const pricing = useAsyncData('pricing', getPricing);

  if (!pricing.data) {
    if (pricing.status !== 'error') return <PageLoader label="Loading pricing…" />;
    return (
      <ConsolePage section="pricing" title={PAGE_TITLE}>
        <Alert
          tone="danger"
          role="alert"
          title="Pricing didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={pricing.reload}>
              Try again
            </Button>
          }
        />
      </ConsolePage>
    );
  }
  return <PricingView pricing={pricing.data} onPricingChange={pricing.mutate} />;
}

interface PricingViewProps {
  pricing: PricingOverview;
  onPricingChange: (pricing: PricingOverview) => void;
}

function PricingView({ pricing, onPricingChange }: PricingViewProps) {
  const toast = useToast();
  const [drafts, setDrafts] = useState(() => draftsFrom(pricing.fareFamilies));
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [promoEditor, setPromoEditor] = useState<PromoEditor | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const { fareFamilies, promoCodes } = pricing;
  const changes = listChanges(fareFamilies, drafts);
  const errorCount = countErrors(drafts);
  const isDirty = changes.length > 0;

  const editFamily = (id: FareFamilyId, change: Partial<FareFamilyDraft>) =>
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...change } }));

  /** Runs a save, shows the fresh pricing and its message. Rethrows so callers can stay open. */
  const save = async (task: () => Promise<PricingResult>) => {
    setIsBusy(true);
    try {
      const result = await task();
      onPricingChange(result.pricing);
      toast.show({ tone: 'success', message: result.message });
      return result.pricing;
    } catch (error) {
      toast.show({
        tone: 'error',
        message:
          error instanceof ApiError
            ? error.message
            : 'That didn’t save. Check your connection and try again.',
      });
      throw error;
    } finally {
      setIsBusy(false);
    }
  };

  const confirm = async () => {
    if (!pendingConfirm) return;
    if (pendingConfirm.kind === 'discard') {
      setDrafts(draftsFrom(fareFamilies));
      setPendingConfirm(null);
      toast.show({ tone: 'success', message: 'Changes discarded · fare families match what’s live' });
      return;
    }
    try {
      if (pendingConfirm.kind === 'publish') {
        const updated = await save(() => publishFareRules(rulesFromDrafts(drafts)));
        setDrafts(draftsFrom(updated.fareFamilies));
      } else {
        await save(() => setPromoPaused(pendingConfirm.promo.code, true));
      }
    } catch {
      // The toast already explained what went wrong.
    }
    setPendingConfirm(null);
  };

  const togglePromo = (promo: PromoCode, isOn: boolean) => {
    if (isOn) void save(() => setPromoPaused(promo.code, false)).catch(() => undefined);
    else setPendingConfirm({ kind: 'pause', promo });
  };

  const submitPromo = async (draft: PromoCodeDraft) => {
    if (!promoEditor) return;
    await save(() =>
      promoEditor.mode === 'new' ? createPromoCode(draft) : updatePromoCode(promoEditor.promo.code, draft),
    );
    setPromoEditor(null);
  };

  const confirmContent = confirmContentFor(pendingConfirm, changes);

  return (
    <ConsolePage
      section="pricing"
      title={PAGE_TITLE}
      description={`${pricing.airlineName} · ${pricing.marketName} market · changes apply to new searches within 5 minutes`}
      actions={
        <Button
          variant="primary"
          iconStart="plus"
          aria-haspopup="dialog"
          onClick={() => setPromoEditor({ mode: 'new' })}
        >
          New promo code
        </Button>
      }
    >
      <section aria-labelledby="fare-families-heading" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 id="fare-families-heading" className={styles.sectionTitle}>
            Fare families
          </h2>
          <span className={styles.sectionNote}>
            <Icon name="lock" size={14} />
            Booking classes and base fares come from the airline’s filing and are read only
          </span>
        </div>
        <div className={styles.families}>
          {fareFamilies.map((family) => (
            <FareFamilyCard
              key={family.id}
              family={family}
              draft={drafts[family.id]}
              onChange={(change) => editFamily(family.id, change)}
            />
          ))}
        </div>
        {isDirty && (
          <UnsavedChangesBar
            hasErrors={errorCount > 0}
            title={
              errorCount
                ? `Fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} to publish`
                : `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'} to fare families`
            }
            description={
              errorCount
                ? 'Check the highlighted fields above'
                : 'They go live for new searches once published'
            }
            actions={
              <>
                <Button
                  variant="quiet"
                  aria-haspopup="dialog"
                  onClick={() => setPendingConfirm({ kind: 'discard' })}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  aria-haspopup="dialog"
                  disabled={errorCount > 0}
                  onClick={() => setPendingConfirm({ kind: 'publish' })}
                >
                  Publish changes
                </Button>
              </>
            }
          />
        )}
        {!isDirty && pricing.lastPublished && (
          <p role="status" className={styles.published}>
            <Icon name="checkCircle" size={16} strokeWidth={1.8} />
            {pricing.lastPublished}
          </p>
        )}
      </section>

      <section aria-labelledby="promo-codes-heading" className={styles.promoCard}>
        <div className={styles.promoHeader}>
          <h2 id="promo-codes-heading" className={styles.sectionTitle}>
            Promo codes
          </h2>
          <span className={styles.sectionNote}>
            Discounts are taken from Vela’s margin, never the airline fare
          </span>
        </div>
        <PromoCodesTable
          promoCodes={promoCodes}
          onToggle={togglePromo}
          onEdit={(promo) => setPromoEditor({ mode: 'edit', promo })}
        />
      </section>

      {promoEditor && (
        <PromoCodeDrawer
          promo={promoEditor.mode === 'edit' ? promoEditor.promo : undefined}
          existingCodes={promoCodes.map((promo) => promo.code)}
          routeOptions={pricing.promoRoutes}
          airlineName={pricing.airlineName}
          onClose={() => setPromoEditor(null)}
          onSubmit={submitPromo}
        />
      )}

      <ConfirmDialog
        content={confirmContent}
        isBusy={isBusy}
        onClose={() => setPendingConfirm(null)}
        onConfirm={() => void confirm()}
      />
    </ConsolePage>
  );
}

function confirmContentFor(
  pending: PendingConfirm | null,
  changes: ReturnType<typeof listChanges>,
): ConfirmDialogContent | null {
  if (!pending) return null;
  const count = changes.length;
  switch (pending.kind) {
    case 'pause':
      return pauseConfirmContent(pending.promo);
    case 'discard':
      return {
        role: 'alertdialog',
        title: `Discard ${count} ${count === 1 ? 'change' : 'changes'}?`,
        body: 'Fare families go back to what’s live now. This can’t be undone.',
        rows: changes,
        cancelLabel: 'Keep editing',
        confirmLabel: 'Discard changes',
        isDestructive: true,
      };
    case 'publish':
      return {
        role: 'dialog',
        title: `Publish ${count} fare family ${count === 1 ? 'change' : 'changes'}?`,
        body: 'New searches use these rules within 5 minutes. Bookings already made keep the rules they were sold with.',
        rows: changes,
        cancelLabel: 'Cancel',
        confirmLabel: 'Publish now',
        isDestructive: false,
      };
  }
}
