import clsx from 'clsx';
import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import type { HelpArticle, HelpTopic, HelpTopicId } from '@/types/help';

import { snippet } from '../lib/helpSearch';
import styles from './SearchResults.module.css';
import { SupportCallout } from './SupportCallout';

const TRY_INSTEAD = ['refund', 'baggage', 'change flight', 'passport'];

interface SearchResultsProps {
  query: string;
  results: HelpArticle[];
  topics: readonly HelpTopic[];
  allArticles: readonly HelpArticle[];
}

export function SearchResults({ query, results, topics, allArticles }: SearchResultsProps) {
  const [topicFilter, setTopicFilter] = useState<HelpTopicId | 'all'>('all');
  const topicsWithResults = topics.filter((topic) => results.some((article) => article.topicId === topic.id));
  const activeFilter =
    topicFilter !== 'all' && topicsWithResults.some((topic) => topic.id === topicFilter)
      ? topicFilter
      : 'all';
  const shown = results.filter((article) => activeFilter === 'all' || article.topicId === activeFilter);
  const topicOf = (id: HelpTopicId) => topics.find((topic) => topic.id === id);

  if (results.length === 0) {
    return (
      <>
        <div className={styles.heading}>
          <h1 className={styles.title}>No results for “{query}”</h1>
          <p className={styles.lead}>
            Check the spelling, or try fewer or more general words — like “refund”, “bag” or “check-in”.
          </p>
        </div>
        <div className={styles.tryInstead}>
          <span className={styles.tryIcon} aria-hidden="true">
            <Icon name="searchX" size={26} strokeWidth={1.6} />
          </span>
          <span className={styles.tryTitle}>Try a popular search instead</span>
          <div className={styles.tryTerms}>
            {TRY_INSTEAD.map((term) => (
              <Link key={term} to={paths.helpSearch(term)} className={styles.tryTerm}>
                {term}
              </Link>
            ))}
          </div>
        </div>
        <section aria-labelledby="browse-topics" className={styles.browse}>
          <h2 id="browse-topics" className={styles.browseTitle}>
            Or browse a topic
          </h2>
          <div className={styles.topicGrid}>
            {topics.map((topic) => (
              <Link key={topic.id} to={`${paths.help}?topic=${topic.id}#topics`} className={styles.topicTile}>
                <span className={styles.topicIcon} aria-hidden="true">
                  <Icon name={topic.icon} size={20} strokeWidth={1.6} />
                </span>
                <span className={styles.topicText}>
                  <span className={styles.topicLabel}>{topic.label}</span>
                  <span className={styles.topicCount}>
                    {allArticles.filter((article) => article.topicId === topic.id).length} articles
                  </span>
                </span>
                <Icon name="chevronRight" size={18} strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        </section>
        <SupportCallout
          layout="wide"
          includeCallback
          title="Still stuck? Ask a person."
          detail="Tell us what you were searching for — a specialist will find the answer for you."
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.heading}>
        <h1 className={styles.title}>Results for “{query}”</h1>
        <p className={styles.lead}>
          {results.length} {results.length === 1 ? 'article' : 'articles'} in {topicsWithResults.length}{' '}
          {topicsWithResults.length === 1 ? 'topic' : 'topics'}
        </p>
      </div>
      <div role="group" aria-label="Filter results by topic" className={styles.filters}>
        {[
          { id: 'all' as const, label: 'All topics', count: results.length },
          ...topicsWithResults.map((topic) => ({
            id: topic.id,
            label: topic.label,
            count: results.filter((article) => article.topicId === topic.id).length,
          })),
        ].map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={activeFilter === filter.id}
            className={clsx(styles.filter, activeFilter === filter.id && styles.filterOn)}
            onClick={() => setTopicFilter(filter.id)}
          >
            {filter.label}
            <span className={styles.filterCount}>{filter.count}</span>
          </button>
        ))}
      </div>
      <div className={styles.layout}>
        <ol className={styles.results}>
          {shown.map((article) => {
            const topic = topicOf(article.topicId);
            return (
              <li key={article.id} className={styles.result}>
                <Link
                  to={`${paths.helpArticle(article.id)}?from=${encodeURIComponent(query)}`}
                  className={styles.resultLink}
                >
                  <span className={styles.resultText}>
                    <span className={styles.resultTopic}>
                      {topic && <Icon name={topic.icon} size={14} strokeWidth={1.8} />}
                      {topic?.label}
                    </span>
                    <span className={styles.resultTitle}>{article.question}</span>
                    <span className={styles.resultSnippet}>{snippet(article.answer)}</span>
                  </span>
                  <Icon name="chevronRight" size={18} strokeWidth={1.8} />
                </Link>
              </li>
            );
          })}
        </ol>
        <div className={styles.aside}>
          <SupportCallout
            title="Not what you’re looking for?"
            detail="A travel specialist can look at your booking with you. Online now, about 2 minutes."
          />
        </div>
      </div>
    </>
  );
}
