import { useState } from 'react';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { PageLoader } from '@/components/layout';
import { Alert, Button, EmptyState, PageHeader, useToast } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatPeso } from '@/lib/format';
import { ApiError } from '@/services/mockApi';
import * as priceAlerts from '@/services/priceAlertsService';
import type { AlertNotificationSettings as Settings, PriceAlert, WatchSuggestion } from '@/types/priceAlert';

import { AlertNotificationSettings } from '../components/alerts/AlertNotificationSettings';
import { CreateAlertForm } from '../components/alerts/CreateAlertForm';
import { DeleteAlertDialog } from '../components/alerts/DeleteAlertDialog';
import { PriceAlertCard } from '../components/alerts/PriceAlertCard';
import { WatchSuggestions } from '../components/alerts/WatchSuggestions';
import { maskMobileNumber } from '../lib/paymentMethodForms';
import {
  alertDatesLabel,
  alertsSummary,
  cityOf,
  parseTargetInput,
  type CreateAlertForm as CreateAlertFormState,
} from '../lib/priceAlerts';
import styles from './PriceAlertsPage.module.css';

const BREADCRUMBS = [
  { label: 'Home', to: paths.home },
  { label: 'Account', to: paths.trips },
  { label: 'Price alerts' },
];

interface PriceAlertsData {
  alerts: PriceAlert[];
  suggestions: WatchSuggestion[];
  settings: Settings;
}

async function loadPriceAlertsPage(): Promise<PriceAlertsData> {
  const [alerts, suggestions, settings] = await Promise.all([
    priceAlerts.listPriceAlerts(),
    priceAlerts.listWatchSuggestions(),
    priceAlerts.getAlertNotificationSettings(),
  ]);
  return { alerts, suggestions, settings };
}

/** Results for the alert's route; flexible alerts fall back to the default dates on the results page. */
function resultsUrlFor(alert: PriceAlert): string {
  const query = new URLSearchParams({ from: alert.from, to: alert.to });
  if (alert.departDate) query.set('depart', alert.departDate);
  if (alert.returnDate) query.set('return', alert.returnDate);
  return `${paths.flights}?${query.toString()}`;
}

export function PriceAlertsPage() {
  useDocumentTitle('Price alerts');
  const result = useAsyncData('price-alerts-page', loadPriceAlertsPage);

  if (result.status === 'error') {
    return (
      <>
        <PageHeader title="Price alerts" breadcrumbs={BREADCRUMBS} />
        <Alert
          tone="danger"
          role="alert"
          title="We couldn’t load your price alerts"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      </>
    );
  }
  if (!result.data) return <PageLoader label="Loading price alerts…" />;
  return <PriceAlertsView initialData={result.data} />;
}

function PriceAlertsView({ initialData }: { initialData: PriceAlertsData }) {
  const toast = useToast();
  const { customer } = useSession();
  const [alerts, setAlerts] = useState(initialData.alerts);
  const [suggestions, setSuggestions] = useState(initialData.suggestions);
  const [settings, setSettings] = useState(initialData.settings);
  const [settingsNote, setSettingsNote] = useState<string>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<string>();

  const watchedRoutes = new Set(alerts.map((alert) => `${alert.from}-${alert.to}`));
  const deleting = alerts.find((alert) => alert.id === deletingId);

  const run = async <T,>(operation: () => Promise<T>, onDone: (value: T) => void) => {
    setIsSaving(true);
    try {
      onDone(await operation());
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'That didn’t save. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const replaceAlert = (updated: PriceAlert) =>
    setAlerts((previous) => previous.map((alert) => (alert.id === updated.id ? updated : alert)));

  const watch = (input: Parameters<typeof priceAlerts.createPriceAlert>[0], message: string) =>
    run(
      () => priceAlerts.createPriceAlert(input),
      (created) => {
        setAlerts((previous) => [created, ...previous]);
        setSuggestions((previous) =>
          previous.filter(
            (suggestion) => `${suggestion.from}-${suggestion.to}` !== `${created.from}-${created.to}`,
          ),
        );
        setIsCreating(false);
        setConfirmation(message);
      },
    );

  const createFromForm = (form: CreateAlertFormState) => {
    const target = parseTargetInput(form.targetInput);
    const targetPrice = typeof target === 'number' ? target : null;
    void watch(
      {
        from: form.from,
        to: form.to,
        departDate: form.dateMode === 'exact' ? form.departDate : null,
        returnDate: form.dateMode === 'exact' ? form.returnDate : null,
        datesLabel: alertDatesLabel(form, DEMO_TODAY),
        travelersLabel: `${form.travelers} · ${form.cabin}`,
        mode: targetPrice === null ? 'drop' : 'below',
        targetPrice,
        watchNearbyDates: form.dateMode === 'flexible',
        channels: { email: settings.email, push: settings.push },
      },
      `Now watching ${cityOf(form.from)} → ${cityOf(form.to)}. We’ll email you when the fare moves.`,
    );
  };

  const watchSuggestion = (suggestion: WatchSuggestion) =>
    watch(
      {
        from: suggestion.from,
        to: suggestion.to,
        departDate: null,
        returnDate: null,
        datesLabel: 'Any dates · next 3 months',
        travelersLabel: '1 adult · Economy',
        mode: 'drop',
        targetPrice: null,
        watchNearbyDates: true,
        channels: { email: settings.email, push: settings.push },
      },
      `Now watching ${cityOf(suggestion.from)} → ${cityOf(suggestion.to)}.`,
    );

  const setPaused = (alert: PriceAlert, isPaused: boolean, message: string) =>
    run(
      () => priceAlerts.setPriceAlertPaused(alert.id, isPaused),
      (updated) => {
        replaceAlert(updated);
        setEditingId(null);
        setDeletingId(null);
        setConfirmation(message);
      },
    );

  const updateSettings = (patch: Partial<Settings>, note: string) => {
    setSettings((previous) => ({ ...previous, ...patch }));
    setSettingsNote(undefined);
    void priceAlerts
      .updateAlertNotificationSettings(patch)
      .then((saved) => {
        setSettings(saved);
        setSettingsNote(note);
      })
      .catch(() => toast.show({ tone: 'error', message: 'That setting didn’t save. Please try again.' }));
  };

  return (
    <>
      <PageHeader
        title="Price alerts"
        breadcrumbs={BREADCRUMBS}
        description={alertsSummary(alerts)}
        actions={
          <Button
            variant="primary"
            iconStart="plus"
            disabled={isCreating}
            onClick={() => {
              setIsCreating(true);
              setConfirmation(undefined);
            }}
          >
            Create alert
          </Button>
        }
      />

      {confirmation && (
        <Alert tone="success" role="status" icon="checkCircle">
          {confirmation}
        </Alert>
      )}

      {isCreating && (
        <CreateAlertForm
          watchedRoutes={watchedRoutes}
          isSaving={isSaving}
          onCancel={() => setIsCreating(false)}
          onCreate={createFromForm}
        />
      )}

      <section aria-labelledby="watching-title" className={styles.section}>
        <h2 id="watching-title" className={styles.sectionTitle}>
          Routes you’re watching
        </h2>
        {alerts.length === 0 ? (
          <EmptyState
            icon="bell"
            headingLevel={3}
            title="No alerts yet"
            description="Watch a route and we’ll tell you the moment fares drop. Most travelers save around 12% by waiting for a dip."
            actions={
              <Button variant="primary" iconStart="plus" onClick={() => setIsCreating(true)}>
                Create your first alert
              </Button>
            }
          />
        ) : (
          alerts.map((alert) => (
            <PriceAlertCard
              key={alert.id}
              alert={alert}
              resultsUrl={resultsUrlFor(alert)}
              isEditing={editingId === alert.id}
              isSaving={isSaving}
              onStartEdit={() => {
                setEditingId(alert.id);
                setConfirmation(undefined);
              }}
              onCancelEdit={() => setEditingId(null)}
              onSaveTarget={(target) =>
                run(
                  () => priceAlerts.updatePriceAlertTarget(alert.id, target),
                  (updated) => {
                    replaceAlert(updated);
                    setEditingId(null);
                    setConfirmation(
                      target === null
                        ? `Target removed for ${cityOf(alert.to)}.`
                        : `Target for ${cityOf(alert.to)} set to ${formatPeso(target)}.`,
                    );
                  },
                )
              }
              onTogglePause={() =>
                setPaused(
                  alert,
                  !alert.isPaused,
                  `${cityOf(alert.to)} alert ${alert.isPaused ? 'resumed' : 'paused'}.`,
                )
              }
              onDelete={() => {
                setEditingId(null);
                setDeletingId(alert.id);
              }}
            />
          ))
        )}
      </section>

      {suggestions.length > 0 && <WatchSuggestions suggestions={suggestions} onWatch={watchSuggestion} />}

      <AlertNotificationSettings
        settings={settings}
        email={customer?.email ?? ''}
        maskedMobile={customer ? maskMobileNumber(customer.mobile) : ''}
        savedNote={settingsNote}
        onChange={updateSettings}
      />

      {deleting && (
        <DeleteAlertDialog
          alert={deleting}
          isDeleting={isSaving}
          onClose={() => setDeletingId(null)}
          onPauseInstead={() =>
            setPaused(deleting, true, `${cityOf(deleting.to)} alert paused. Its price history is kept.`)
          }
          onDelete={() =>
            run(
              () => priceAlerts.deletePriceAlert(deleting.id),
              () => {
                setAlerts((previous) => previous.filter((alert) => alert.id !== deleting.id));
                setDeletingId(null);
                setConfirmation(`${cityOf(deleting.from)} → ${cityOf(deleting.to)} alert deleted.`);
              },
            )
          }
        />
      )}
    </>
  );
}
