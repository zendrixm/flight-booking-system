import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { EmptyState, LinkButton, SegmentedControl, useToast } from '@/components/ui';
import { setOrDelete, useAsyncData, useDocumentTitle, useUrlQuery } from '@/hooks';
import type { Trip } from '@/types/trip';

import { dispatchSearch } from '../../search/state/phoneSearchStore';
import { PhoneDataState } from '../../shared/components/PhoneDataState';
import { PhoneScreen } from '../../shared/components/PhoneScreen';
import { WebLink } from '../../shared/components/WebLink';
import { loadPhoneTrips, pastTrips, upcomingTrips } from '../../shared/lib/phoneTrips';
import { PhonePastTripRow } from '../components/PhonePastTripRow';
import { PhoneUpcomingTripCard } from '../components/PhoneUpcomingTripCard';
import styles from './PhoneTripsPage.module.css';

type TripsView = 'upcoming' | 'past';

export function PhoneTripsPage() {
  useDocumentTitle('My trips');
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, updateQuery] = useUrlQuery();
  const view: TripsView = searchParams.get('view') === 'past' ? 'past' : 'upcoming';
  const trips = useAsyncData('phone-trips', loadPhoneTrips);

  if (!trips.data) {
    return (
      <PhoneScreen title="My trips">
        <PhoneDataState status={trips.status} subject="your trips" onRetry={trips.reload} />
      </PhoneScreen>
    );
  }

  const upcoming = upcomingTrips(trips.data);
  const past = pastTrips(trips.data);

  /** Starts a new search to the same place from the same airport; dates are left to choose. */
  const bookAgain = (trip: Trip) => {
    dispatchSearch({ type: 'setTripType', tripType: 'round' });
    dispatchSearch({ type: 'choosePlace', field: 'from', code: trip.originCode });
    dispatchSearch({ type: 'choosePlace', field: 'to', code: trip.destinationCode });
    toast.show({ tone: 'success', message: `${trip.city} is set — pick your dates and search` });
    navigate(paths.phone.search);
  };

  return (
    <PhoneScreen title="My trips">
      <SegmentedControl<TripsView>
        label="Trips"
        appearance="soft"
        fullWidth
        options={[
          { value: 'upcoming', label: `Upcoming · ${upcoming.length}` },
          { value: 'past', label: `Past · ${past.length}` },
        ]}
        value={view}
        onChange={(next) => updateQuery((params) => setOrDelete(params, 'view', next, 'upcoming'))}
      />

      {view === 'upcoming' ? (
        upcoming.length > 0 ? (
          <div className={styles.list}>
            {upcoming.map((phoneTrip) => (
              <PhoneUpcomingTripCard key={phoneTrip.trip.reference} phoneTrip={phoneTrip} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="plane"
            title="No trips coming up"
            description="When you book, your trips and boarding passes show up here."
            actions={
              <LinkButton to={paths.phone.search} size="small">
                Search flights
              </LinkButton>
            }
          />
        )
      ) : (
        <>
          <ul className={styles.list}>
            {past.map(({ trip }) => (
              <PhonePastTripRow key={trip.reference} trip={trip} onBookAgain={bookAgain} />
            ))}
          </ul>
          <WebLink to={paths.trips}>Receipts and cancelled trips on the web</WebLink>
        </>
      )}
    </PhoneScreen>
  );
}
