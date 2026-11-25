import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Breadcrumbs, IconButton } from '@/components/ui';
import { POPULAR_ARTICLE_IDS } from '@/mocks/helpCentre';
import { listHelpArticles, listHelpTopics } from '@/services/helpService';

import { normalizeQuery, searchArticles } from '../lib/helpSearch';
import styles from './HelpHero.module.css';

const MAX_SUGGESTIONS = 5;

interface HelpHeroProps {
  /** The search already shown in results, if any. */
  submittedQuery?: string;
  /** The big "How can we help?" title and popular searches only show on the help centre home. */
  isHome: boolean;
}

/** Midnight band under the app bar with the help search; suggestions appear while typing. */
export function HelpHero({ submittedQuery = '', isHome }: HelpHeroProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(submittedQuery);
  const [areSuggestionsDismissed, setAreSuggestionsDismissed] = useState(false);
  const topics = listHelpTopics();
  const matches = searchArticles(listHelpArticles(), query);
  const hasQuery = normalizeQuery(query).length > 0;
  const showSuggestions =
    hasQuery && normalizeQuery(query) !== normalizeQuery(submittedQuery) && !areSuggestionsDismissed;
  const topicLabel = (topicId: string) => topics.find((topic) => topic.id === topicId)?.label ?? '';

  const submit = () => {
    if (hasQuery) navigate(paths.helpSearch(query.trim()));
  };

  return (
    <section className={styles.hero} aria-label="Search help">
      <svg className={styles.globe} width="640" height="640" viewBox="0 0 640 640" aria-hidden="true">
        <g fill="none" stroke="currentColor">
          <circle cx="320" cy="320" r="300" />
          <ellipse cx="320" cy="320" rx="200" ry="300" />
          <ellipse cx="320" cy="320" rx="90" ry="300" />
          <ellipse cx="320" cy="220" rx="280" ry="46" />
          <ellipse cx="320" cy="320" rx="300" ry="52" />
          <ellipse cx="320" cy="420" rx="280" ry="46" />
        </g>
      </svg>
      <div className={styles.inner}>
        <Breadcrumbs
          surface="dark"
          items={[{ label: 'Home', to: paths.home }, { label: 'Help centre' }]}
          className={styles.breadcrumbs}
        />
        <span className={styles.eyebrow}>Help centre · open 24/7</span>
        {isHome && (
          <h1 className={styles.title}>
            How can we <em>help?</em>
          </h1>
        )}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape from the input or any suggestion link closes the list */}
        <form
          role="search"
          className={styles.searchArea}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setAreSuggestionsDismissed(true);
          }}
        >
          <div className={styles.searchBox}>
            <Icon name="search" size={20} strokeWidth={1.8} className={styles.searchIcon} />
            <input
              type="search"
              value={query}
              aria-label="Search help articles"
              aria-controls={showSuggestions ? 'help-suggestions' : undefined}
              placeholder="Search for refunds, baggage, name changes…"
              className={styles.input}
              onChange={(event) => {
                setQuery(event.target.value);
                setAreSuggestionsDismissed(false);
              }}
            />
            {hasQuery && (
              <IconButton icon="close" label="Clear search" variant="soft" onClick={() => setQuery('')} />
            )}
            <button type="submit" className={styles.submit} disabled={!hasQuery}>
              Search
            </button>
          </div>
          {showSuggestions && (
            <div id="help-suggestions" className={styles.suggestions}>
              {matches.length > 0 ? (
                <>
                  <ul aria-label="Suggested articles" className={styles.suggestionList}>
                    {matches.slice(0, MAX_SUGGESTIONS).map((article) => (
                      <li key={article.id}>
                        <Link to={paths.helpArticle(article.id)} className={styles.suggestion}>
                          <span className={styles.suggestionText}>
                            <span className={styles.suggestionTitle}>{article.question}</span>
                            <span className={styles.suggestionTopic}>{topicLabel(article.topicId)}</span>
                          </span>
                          <Icon name="chevronRight" size={16} strokeWidth={1.8} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="submit" className={styles.seeAll}>
                    <Icon name="search" size={16} strokeWidth={1.8} />
                    See all {matches.length} results for “{query.trim()}”
                  </button>
                </>
              ) : (
                <div className={styles.noMatch} role="status">
                  <span className={styles.suggestionTitle}>No articles match “{query.trim()}”</span>
                  <span className={styles.suggestionTopic}>
                    Try fewer words, or chat with us — we’re online now.
                  </span>
                </div>
              )}
            </div>
          )}
        </form>
        {isHome && (
          <div className={styles.popular}>
            <span className={styles.popularLabel}>Popular:</span>
            {POPULAR_ARTICLE_IDS.map((item) => (
              <Link
                key={item.articleId}
                to={paths.helpArticle(item.articleId)}
                className={styles.popularChip}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
