import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { PageContainer } from '@/components/layout';
import { FindBookingForm } from '@/features/trips/components/FindBookingForm';
import { useDocumentTitle } from '@/hooks';
import { searchFromQuery } from '@/lib/flightSearchUrl';

import { HomeHero } from '../components/home/HomeHero';
import { TrendingDeals } from '../components/home/TrendingDeals';
import { ValueProps } from '../components/home/ValueProps';
import { FlightSearchCard } from '../components/search/FlightSearchCard';
import { INITIAL_SEARCH_FORM, searchFormFromParams } from '../lib/searchForm';
import styles from './HomePage.module.css';

export function HomePage() {
  useDocumentTitle('Flights, without the fine print');
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  // "Modify search" on the results page links back here with the current search in the URL.
  const initialForm = useMemo(
    () =>
      queryString
        ? searchFormFromParams(searchFromQuery(new URLSearchParams(queryString)))
        : INITIAL_SEARCH_FORM,
    [queryString],
  );

  return (
    <main>
      <HomeHero />
      <section className={styles.searchSection} aria-label="Search flights">
        <FlightSearchCard key={queryString} initialState={initialForm} />
      </section>
      <PageContainer>
        <TrendingDeals />
        <FindBookingForm />
        <ValueProps />
      </PageContainer>
    </main>
  );
}
