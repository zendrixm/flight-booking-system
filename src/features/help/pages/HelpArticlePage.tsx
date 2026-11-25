import { Link, useParams, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { PageContainer } from '@/components/layout';
import { Button, EmptyState, LinkButton } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { findHelpArticle, listHelpArticles, listHelpTopics } from '@/services/helpService';
import type { HelpArticle } from '@/types/help';

import { ArticleFeedback } from '../components/ArticleFeedback';
import { HelpHero } from '../components/HelpHero';
import { HelpSupportProvider } from '../components/HelpSupportProvider';
import { SupportCallout } from '../components/SupportCallout';
import { useHelpSupport } from '../state/helpSupportContext';
import styles from './HelpPages.module.css';

const RELATED_COUNT = 4;

export function HelpArticlePage() {
  const { articleId = '' } = useParams();
  const article = findHelpArticle(articleId);
  useDocumentTitle(article ? article.question : 'Help article');

  return (
    <HelpSupportProvider>
      <main>
        <HelpHero isHome={false} />
        <PageContainer layout="stack" className={styles.content}>
          {article ? (
            <ArticleView key={article.id} article={article} />
          ) : (
            <EmptyState
              icon="searchX"
              title="We can’t find that article"
              description="It may have moved. Search the help centre or browse a topic instead."
              actions={
                <LinkButton to={paths.help} variant="primary">
                  Go to the help centre
                </LinkButton>
              }
            />
          )}
        </PageContainer>
      </main>
    </HelpSupportProvider>
  );
}

function ArticleView({ article }: { article: HelpArticle }) {
  const { openChat } = useHelpSupport();
  const [searchParams] = useSearchParams();
  const fromQuery = searchParams.get('from');
  const topic = listHelpTopics().find((candidate) => candidate.id === article.topicId);
  const related = listHelpArticles()
    .filter((candidate) => candidate.topicId === article.topicId && candidate.id !== article.id)
    .slice(0, RELATED_COUNT);
  const details = article.details;
  const topicLink = `${paths.help}?topic=${article.topicId}#topics`;

  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.articleNav}>
        <ol className={styles.crumbs}>
          <li>
            <Link to={paths.help}>Help centre</Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" size={14} strokeWidth={1.8} />
          </li>
          <li>
            <Link to={topicLink}>{topic?.label}</Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" size={14} strokeWidth={1.8} />
          </li>
          <li aria-current="page" className={styles.currentCrumb}>
            {article.question}
          </li>
        </ol>
        {fromQuery && (
          <LinkButton
            to={paths.helpSearch(fromQuery)}
            variant="quiet"
            size="small"
            iconStart="arrowLeft"
            className={styles.backToResults}
          >
            Back to results for “{fromQuery}”
          </LinkButton>
        )}
      </nav>

      <div className={styles.articleLayout}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            {topic && (
              <span className={styles.topicChip}>
                <Icon name={topic.icon} size={16} strokeWidth={1.8} />
                {topic.label}
              </span>
            )}
            <h1 className={styles.articleTitle}>{article.question}</h1>
            <span className={styles.meta}>
              Updated {details?.updatedOn ?? '28 Sep 2026'} · {details?.readingMinutes ?? 2} min read
            </span>
          </header>

          <p className={styles.answer}>{article.answer}</p>

          {details?.table && (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>{details.table.title}</h2>
              <div className={styles.table}>
                {details.table.rows.map((row) => (
                  <div key={row.label} className={styles.tableRow}>
                    <span className={styles.tableLabel}>{row.label}</span>
                    <span className={styles.tableValue}>{row.value}</span>
                    <span className={styles.tableNote}>{row.note}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {details?.steps && (
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Step by step</h2>
              <ol className={styles.steps}>
                {details.steps.map((step, index) => (
                  <li key={step.title} className={styles.step}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className={styles.stepText}>
                      <span className={styles.stepTitle}>{step.title}</span>
                      <span className={styles.stepDetail}>{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {details?.tips && (
            <section className={styles.tips}>
              <h2 className={styles.tipsTitle}>Good to know</h2>
              <ul className={styles.tipList}>
                {details.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          )}

          <div className={styles.articleActions}>
            {article.link && (
              <LinkButton to={article.link.to} variant="primary" size="large" iconEnd="arrowRight">
                {article.link.label}
              </LinkButton>
            )}
            <Button variant="quiet" size="large" onClick={openChat}>
              Ask a specialist
            </Button>
          </div>

          <ArticleFeedback
            articleId={article.id}
            helpfulNote={details?.helpfulNote ?? 'Your answer helps us improve this page'}
          />
        </article>

        <aside className={styles.articleAside}>
          {related.length > 0 && (
            <section aria-labelledby="related-title" className={styles.related}>
              <h2 id="related-title" className={styles.relatedTitle}>
                More in {topic?.label}
              </h2>
              <ul className={styles.relatedList}>
                {related.map((candidate) => (
                  <li key={candidate.id}>
                    <Link to={paths.helpArticle(candidate.id)} className={styles.relatedLink}>
                      {candidate.question}
                      <Icon name="chevronRight" size={16} strokeWidth={1.8} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <SupportCallout
            showOnlineStatus
            title="Still need help?"
            detail="A specialist can make the change for you while you wait."
          />
        </aside>
      </div>
    </>
  );
}
