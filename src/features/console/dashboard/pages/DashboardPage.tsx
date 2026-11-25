import { useState } from 'react';

import { useStaffSession } from '@/app/providers';
import { PageLoader } from '@/components/layout';
import { Alert, Button, SegmentedControl } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { getDashboardActivity, getDashboardOverview } from '@/services/console/dashboardService';
import type { DashboardRange } from '@/types/console/dashboard';

import { ConsolePage } from '../../shared/components/ConsolePage';
import { LatestBookings, LiveDisruptions, NeedsAttention } from '../components/ActivityPanels';
import { BookingsChart } from '../components/BookingsChart';
import { ExportDialog } from '../components/ExportDialog';
import { KpiCard } from '../components/KpiCard';
import { TopRoutes } from '../components/TopRoutes';
import { DASHBOARD_RANGE_OPTIONS } from '../lib/dashboardFormat';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { workspace } = useStaffSession();
  const [range, setRange] = useState<DashboardRange>('7d');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const overview = useAsyncData(`dashboard-${range}`, () => getDashboardOverview(range));
  const activity = useAsyncData('dashboard-activity', getDashboardActivity);
  const rangeLabel = DASHBOARD_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? '';

  const renderContent = () => {
    if (overview.status === 'error' || activity.status === 'error') {
      return (
        <Alert
          tone="danger"
          role="alert"
          title="The dashboard didn’t load"
          action={
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                overview.reload();
                activity.reload();
              }}
            >
              Try again
            </Button>
          }
        />
      );
    }
    if (!overview.data || !activity.data) return <PageLoader label="Loading the dashboard…" />;
    return (
      <>
        <section aria-label="Key metrics" className={styles.kpis} aria-busy={overview.status === 'loading'}>
          {overview.data.kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>
        <div className={styles.row}>
          <BookingsChart overview={overview.data} />
          <TopRoutes routes={overview.data.topRoutes} rangeLabel={rangeLabel} />
        </div>
        <div className={styles.row}>
          <LiveDisruptions disruptions={activity.data.disruptions} />
          <NeedsAttention queues={activity.data.queues} />
        </div>
        <LatestBookings bookings={activity.data.recentBookings} />
      </>
    );
  };

  return (
    <ConsolePage
      section="dashboard"
      title="Operations overview"
      documentTitle="Dashboard"
      breadcrumbs={[{ label: 'Overview' }, { label: 'Dashboard' }]}
      description={`${workspace.name} · amounts in PHP · data refreshed 2 minutes ago`}
      actions={
        <>
          <SegmentedControl<DashboardRange>
            label="Date range"
            density="compact"
            value={range}
            onChange={setRange}
            options={DASHBOARD_RANGE_OPTIONS}
          />
          <Button
            variant="quiet"
            iconStart="download"
            aria-haspopup="dialog"
            onClick={() => setIsExportOpen(true)}
          >
            Export
          </Button>
        </>
      }
    >
      {renderContent()}
      {isExportOpen && <ExportDialog initialRange={range} onClose={() => setIsExportOpen(false)} />}
    </ConsolePage>
  );
}
