import clsx from 'clsx';
import { useRef, useState, type KeyboardEvent } from 'react';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { LinkButton } from '@/components/ui';
import { sendArticleFeedback } from '@/services/helpService';
import type { HelpArticle, HelpTopic, HelpTopicId } from '@/types/help';

import { articlesInTopic } from '../lib/helpSearch';
import styles from './TopicBrowser.module.css';

interface TopicBrowserProps {
  topics: readonly HelpTopic[];
  articles: readonly HelpArticle[];
  selectedTopicId: HelpTopicId;
  onSelectTopic: (topicId: HelpTopicId) => void;
}

/** Topics as vertical tabs, each with its questions as an accordion. */
export function TopicBrowser({ topics, articles, selectedTopicId, onSelectTopic }: TopicBrowserProps) {
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const topic = topics.find((candidate) => candidate.id === selectedTopicId) ?? topics[0];
  const topicArticles = articlesInTopic(articles, topic.id);

  const selectAt = (index: number) => {
    const next = topics[(index + topics.length) % topics.length];
    onSelectTopic(next.id);
    setOpenArticleId(null);
    tabRefs.current[(index + topics.length) % topics.length]?.focus();
  };

  const handleTabKey = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: topics.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      selectAt(moves[event.key]);
    }
  };

  return (
    <section id="topics" aria-labelledby="topics-title" className={styles.section}>
      <div className={styles.heading}>
        <h2 id="topics-title" className={styles.title}>
          Browse by topic
        </h2>
        <span className={styles.count}>{articles.length} articles · updated this week</span>
      </div>
      <div className={styles.layout}>
        <div role="tablist" aria-label="Topics" aria-orientation="vertical" className={styles.tabs}>
          {topics.map((candidate, index) => {
            const isSelected = candidate.id === topic.id;
            return (
              <button
                key={candidate.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`topic-tab-${candidate.id}`}
                aria-selected={isSelected}
                aria-controls="topic-panel"
                tabIndex={isSelected ? 0 : -1}
                className={clsx(styles.tab, isSelected && styles.tabSelected)}
                onClick={() => selectAt(index)}
                onKeyDown={(event) => handleTabKey(index, event)}
              >
                <Icon name={candidate.icon} size={18} strokeWidth={1.6} className={styles.tabIcon} />
                <span className={styles.tabLabel}>{candidate.label}</span>
                <span className={styles.tabCount}>{articlesInTopic(articles, candidate.id).length}</span>
              </button>
            );
          })}
        </div>

        <div
          id="topic-panel"
          role="tabpanel"
          aria-labelledby={`topic-tab-${topic.id}`}
          className={styles.panel}
        >
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon} aria-hidden="true">
              <Icon name={topic.icon} size={22} strokeWidth={1.6} />
            </span>
            <span className={styles.panelText}>
              <span className={styles.panelTitle}>{topic.label}</span>
              <span className={styles.panelDescription}>{topic.description}</span>
            </span>
            <LinkButton to={topic.action.to} variant="quiet" size="small" iconEnd="arrowRight">
              {topic.action.label}
            </LinkButton>
          </div>
          {topicArticles.map((article) => (
            <ArticleAccordionItem
              key={article.id}
              article={article}
              isOpen={openArticleId === article.id}
              onToggle={() => setOpenArticleId((current) => (current === article.id ? null : article.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ArticleAccordionItemProps {
  article: HelpArticle;
  isOpen: boolean;
  onToggle: () => void;
}

function ArticleAccordionItem({ article, isOpen, onToggle }: ArticleAccordionItemProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const answerId = `answer-${article.id}`;

  const castVote = (next: 'up' | 'down') => {
    setVote(next);
    void sendArticleFeedback(article.id, { isHelpful: next === 'up' });
  };

  return (
    <div className={styles.item}>
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={answerId}
          className={styles.question}
          onClick={onToggle}
        >
          {article.question}
          <Icon
            name="chevronDown"
            size={18}
            strokeWidth={1.8}
            className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
          />
        </button>
      </h3>
      {isOpen && (
        <div id={answerId} className={styles.answer}>
          <p className={styles.answerText}>{article.answer}</p>
          <div className={styles.answerActions}>
            {article.link && (
              <LinkButton to={article.link.to} variant="primary" size="small">
                {article.link.label}
              </LinkButton>
            )}
            <LinkButton to={paths.helpArticle(article.id)} variant="quiet" size="small">
              Read full article
            </LinkButton>
            <span className={styles.helpfulLabel}>Was this helpful?</span>
            <button
              type="button"
              aria-pressed={vote === 'up'}
              className={styles.vote}
              onClick={() => castVote('up')}
            >
              Yes
            </button>
            <button
              type="button"
              aria-pressed={vote === 'down'}
              className={styles.vote}
              onClick={() => castVote('down')}
            >
              No
            </button>
            {vote && (
              <span role="status" className={styles.thanks}>
                Thanks for telling us
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
