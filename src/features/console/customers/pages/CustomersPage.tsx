import { useState } from 'react';

import { Icon } from '@/components/icons';
import { PageLoader } from '@/components/layout';
import { Alert, Button, Tabs, TextField } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { formatNumber } from '@/lib/format';
import { listCustomers } from '@/services/console/customersService';
import type { CustomerSegment } from '@/types/console/customer';

import { ConsolePage } from '../../shared/components/ConsolePage';
import { CustomerDrawer } from '../components/CustomerDrawer';
import { CustomersTable } from '../components/CustomersTable';
import { useCustomerListQuery } from '../hooks/useCustomerListQuery';
import { listFooter, SEGMENTS } from '../lib/customerPresentation';
import styles from './CustomersPage.module.css';

const PAGE_TITLE = 'Customers';

export function CustomersPage() {
  const { segment, search, openCustomerId, update } = useCustomerListQuery();
  // Bumped after drawer actions so tier, credit and status columns refresh.
  const [revision, setRevision] = useState(0);
  const list = useAsyncData(`customers:${segment}:${search}:${revision}`, () =>
    listCustomers({ segment, search }),
  );

  if (!list.data) {
    if (list.status !== 'error') return <PageLoader label="Loading customers…" />;
    return (
      <ConsolePage section="customers" title={PAGE_TITLE}>
        <Alert
          tone="danger"
          role="alert"
          title="Customers didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={list.reload}>
              Try again
            </Button>
          }
        />
      </ConsolePage>
    );
  }

  const { customers, segmentTotals, joinedThisWeek } = list.data;
  const segmentLabel = SEGMENTS.find((item) => item.id === segment)?.label ?? 'All';
  const openSummary = customers.find((customer) => customer.id === openCustomerId);

  return (
    <ConsolePage
      section="customers"
      title={PAGE_TITLE}
      description={
        <span className={styles.description}>
          {formatNumber(segmentTotals.all)} accounts · {formatNumber(joinedThisWeek)} joined this week
          <span className={styles.privacy}>
            <Icon name="shield" size={14} />
            Personal data is masked · reveals are audited
          </span>
        </span>
      }
    >
      <Tabs<CustomerSegment>
        label="Segments"
        items={SEGMENTS.map((item) => ({ ...item, count: segmentTotals[item.id] }))}
        value={segment}
        countMax={Number.POSITIVE_INFINITY}
        onChange={(next) => update({ segment: next })}
      >
        <div className={styles.panel}>
          <TextField
            label="Search customers"
            labelHidden
            type="search"
            leadingIcon="search"
            placeholder="Name, email or member number"
            className={styles.search}
            value={search}
            onChange={(event) => update({ search: event.target.value })}
          />

          <section
            aria-label="Customer list"
            aria-busy={list.status === 'loading' || undefined}
            className={styles.tableCard}
          >
            {customers.length > 0 ? (
              <CustomersTable
                customers={customers}
                openCustomerId={openCustomerId}
                onOpen={(customerId) => update({ customer: customerId })}
              />
            ) : (
              <div className={styles.empty}>
                <p>
                  {search
                    ? `No customers match “${search}” in this segment.`
                    : 'No customers in this segment right now.'}
                </p>
                {search && (
                  <Button variant="quiet" onClick={() => update({ search: '' })}>
                    Clear search
                  </Button>
                )}
              </div>
            )}
            <p className={styles.footer}>
              {listFooter(customers.length, segmentTotals[segment], segmentLabel)}
            </p>
          </section>
        </div>
      </Tabs>

      {openCustomerId && (
        <CustomerDrawer
          key={openCustomerId}
          customerId={openCustomerId}
          summary={openSummary}
          onClose={() => update({ customer: null })}
          onChanged={() => setRevision((count) => count + 1)}
        />
      )}
    </ConsolePage>
  );
}
