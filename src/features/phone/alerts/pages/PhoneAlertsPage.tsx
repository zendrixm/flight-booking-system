import { useState } from 'react';

import { paths } from '@/app/paths';
import { Button, EmptyState, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { ApiError } from '@/services/mockApi';
import { createPriceAlert, listPriceAlerts } from '@/services/priceAlertsService';
import type { NewPriceAlert } from '@/types/priceAlert';

import { PhoneDataState } from '../../shared/components/PhoneDataState';
import { PhoneScreen } from '../../shared/components/PhoneScreen';
import { WebLink } from '../../shared/components/WebLink';
import { NewAlertSheet } from '../components/NewAlertSheet';
import { PhoneAlertCard } from '../components/PhoneAlertCard';
import { alertRouteLabel, alertsSummary } from '../lib/alertSummary';
import styles from './PhoneAlertsPage.module.css';

export function PhoneAlertsPage() {
  useDocumentTitle('Price alerts');
  const toast = useToast();
  const alerts = useAsyncData('phone-price-alerts', listPriceAlerts);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const newAlertButton = (
    <Button iconStart="plus" aria-haspopup="dialog" onClick={() => setIsCreating(true)}>
      New alert
    </Button>
  );

  if (!alerts.data) {
    return (
      <PhoneScreen title="Price alerts" actions={newAlertButton}>
        <PhoneDataState status={alerts.status} subject="your price alerts" onRetry={alerts.reload} />
      </PhoneScreen>
    );
  }

  const list = alerts.data;
  const create = async (input: NewPriceAlert) => {
    setIsSaving(true);
    try {
      const created = await createPriceAlert(input);
      alerts.mutate([created, ...list]);
      setIsCreating(false);
      toast.show({ tone: 'success', message: `Now watching ${alertRouteLabel(created)}` });
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'The alert wasn’t created. Try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PhoneScreen title="Price alerts" actions={newAlertButton}>
      {list.length > 0 ? (
        <>
          <p className={styles.summary}>{alertsSummary(list)}</p>
          <ul className={styles.list}>
            {list.map((alert) => (
              <PhoneAlertCard key={alert.id} alert={alert} />
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon="bell"
          title="No price alerts yet"
          description="Watch a route and we’ll tell you when the fare drops."
        />
      )}
      <WebLink to={paths.account.priceAlerts}>Edit targets, pause or delete on the web</WebLink>

      {isCreating && (
        <NewAlertSheet
          existingAlerts={list}
          isSaving={isSaving}
          onClose={() => setIsCreating(false)}
          onCreate={(input) => void create(input)}
        />
      )}
    </PhoneScreen>
  );
}
