import { Link, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { PageContainer } from '@/components/layout';
import { useDocumentTitle } from '@/hooks';
import { TRAVEL_ADVISORY } from '@/mocks/helpCentre';
import { listHelpArticles, listHelpTopics } from '@/services/helpService';

import { HelpHero } from '../components/HelpHero';
import { HelpSupportProvider } from '../components/HelpSupportProvider';
import { AdvisoryBanner, ContactOptions, QuickActions } from '../components/HomeSections';
import { RefundTracker } from '../components/RefundTracker';
import { SearchResults } from '../components/SearchResults';
import { TopicBrowser } from '../components/TopicBrowser';
import { isHelpTopicId, searchArticles } from '../lib/helpSearch';
import styles from './HelpPages.module.css';

/** `/help` is the help centre home; `/help?q=…` shows search results in the same layout. */
export function HelpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const topicParam = searchParams.get('topic');
  const topics = listHelpTopics();
  const articles = listHelpArticles();
  const selectedTopicId = isHelpTopicId(topicParam, topics) ? topicParam : topics[0].id;
  useDocumentTitle(query ? `Help: ${query}` : 'Help centre');

  return (
    <HelpSupportProvider>
      <main>
        {/* Keyed by query so the search box resets when the URL changes. */}
        <HelpHero key={query} submittedQuery={query} isHome={!query} />
        <PageContainer layout="stack" className={styles.content}>
          {query ? (
            <>
              <Link to={paths.help} className={styles.backLink}>
                <Icon name="arrowLeft" size={16} strokeWidth={1.8} />
                Help centre home
              </Link>
              <SearchResults
                query={query}
                results={searchArticles(articles, query)}
                topics={topics}
                allArticles={articles}
              />
            </>
          ) : (
            <>
              <AdvisoryBanner advisory={TRAVEL_ADVISORY} />
              <QuickActions />
              <TopicBrowser
                topics={topics}
                articles={articles}
                selectedTopicId={selectedTopicId}
                onSelectTopic={(topicId) => {
                  const next = new URLSearchParams(searchParams);
                  next.set('topic', topicId);
                  setSearchParams(next, { replace: true, preventScrollReset: true });
                }}
              />
              <RefundTracker />
              <ContactOptions />
            </>
          )}
        </PageContainer>
      </main>
    </HelpSupportProvider>
  );
}
