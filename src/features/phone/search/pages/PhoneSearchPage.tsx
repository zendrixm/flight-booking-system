import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Avatar, Logo } from '@/components/ui';
import { getSearchErrors, toSearchParams } from '@/features/booking/lib/searchForm';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { searchToQueryString } from '@/lib/flightSearchUrl';
import { initialsOf } from '@/lib/format';

import { PhoneScreen, PhoneSection } from '../../shared/components/PhoneScreen';
import { loadPhoneTrips, nextTripOf } from '../../shared/lib/phoneTrips';
import { AirportSheet } from '../components/AirportSheet';
import { DatesSheet } from '../components/DatesSheet';
import { NextTripCard } from '../components/NextTripCard';
import { RecentSearches } from '../components/RecentSearches';
import { SearchCard } from '../components/SearchCard';
import { TravelersSheet } from '../components/TravelersSheet';
import { readRecentSearches, rememberSearch } from '../lib/recentSearches';
import type { SearchSheet } from '../lib/searchSheets';
import { dispatchSearch, phoneSearchStore, usePhoneSearch } from '../state/phoneSearchStore';
import styles from './PhoneSearchPage.module.css';

export function PhoneSearchPage() {
  useDocumentTitle('Search flights');
  const navigate = useNavigate();
  const { customer } = useSession();
  const search = usePhoneSearch();
  const [sheet, setSheet] = useState<SearchSheet | null>(null);
  const [recentSearches] = useState(readRecentSearches);
  const trips = useAsyncData(`phone-trips-${customer?.id ?? 'guest'}`, () =>
    customer ? loadPhoneTrips() : Promise.resolve([]),
  );
  const nextTrip = trips.data && nextTripOf(trips.data);
  const closeSheet = () => setSheet(null);

  const openSheet = (next: SearchSheet) => {
    // Tapping Return on a one-way trip turns it back into a round trip.
    if (next === 'return' && search.tripType === 'oneway') {
      dispatchSearch({ type: 'setTripType', tripType: 'round' });
    }
    setSheet(next);
  };

  const submit = () => {
    dispatchSearch({ type: 'trySearch' });
    const current = phoneSearchStore.getState();
    if (getSearchErrors(current).length > 0) return;
    const params = toSearchParams(current);
    rememberSearch(params);
    navigate(paths.phone.results(searchToQueryString(params)));
  };

  return (
    <PhoneScreen
      spacing="loose"
      header={
        <div className={styles.brandRow}>
          <Logo to={paths.phone.search} label="Vela, search flights" size={26} />
          {customer ? (
            <Link to={paths.phone.account} aria-label="Account" className={styles.avatarLink}>
              <Avatar
                initials={initialsOf(`${customer.firstName} ${customer.lastName}`)}
                size={44}
                tone="brass"
              />
            </Link>
          ) : (
            <Link
              to={`${paths.signIn}?redirect=${encodeURIComponent(paths.phone.search)}`}
              className={styles.signIn}
            >
              Sign in
            </Link>
          )}
        </div>
      }
      title={
        customer ? (
          <>
            Where to next, <em className={styles.name}>{customer.firstName}?</em>
          </>
        ) : (
          'Where to next?'
        )
      }
    >
      <SearchCard search={search} onOpenSheet={openSheet} onSearch={submit} />

      {nextTrip && (
        <PhoneSection label="Your next trip">
          <NextTripCard nextTrip={nextTrip} />
        </PhoneSection>
      )}

      {recentSearches.length > 0 && (
        <PhoneSection label="Recent searches">
          <RecentSearches searches={recentSearches} />
        </PhoneSection>
      )}

      {(sheet === 'from' || sheet === 'to') && (
        <AirportSheet
          field={sheet}
          selectedCode={search[sheet].code}
          onClose={closeSheet}
          onPick={(code) => {
            dispatchSearch({ type: 'choosePlace', field: sheet, code });
            closeSheet();
          }}
        />
      )}
      {(sheet === 'depart' || sheet === 'return') && (
        <DatesSheet search={search} initialTarget={sheet} onClose={closeSheet} />
      )}
      {sheet === 'travelers' && <TravelersSheet search={search} onClose={closeSheet} />}
    </PhoneScreen>
  );
}
