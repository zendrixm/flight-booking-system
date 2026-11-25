import { Icon } from '@/components/icons';
import { LinkButton } from '@/components/ui';
import type { LegalDocument } from '@/types/legal';

import { CookieChoices } from './CookieChoices';
import styles from './LegalArticle.module.css';
import { sectionNumber } from './LegalSidebar';

interface LegalArticleProps {
  policy: LegalDocument;
}

export function LegalArticle({ policy }: LegalArticleProps) {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h2 className={styles.title}>{policy.title}</h2>
        <span className={styles.updated}>{policy.updated}</span>
      </header>

      <section aria-labelledby="legal-summary-heading" className={styles.summary}>
        <h3 id="legal-summary-heading" className={styles.summaryTitle}>
          The short version
        </h3>
        <ul className={styles.summaryList}>
          {policy.summary.map((point) => (
            <li key={point} className={styles.summaryPoint}>
              <Icon name="check" size={18} strokeWidth={2} className={styles.summaryIcon} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {policy.id === 'cookies' && <CookieChoices />}

      {policy.sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className={styles.section}
        >
          <h3 id={`${section.id}-heading`} className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>{sectionNumber(index)}</span>
            {section.title}
          </h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <div className={styles.callToAction}>
        <span className={styles.ctaText}>
          <span className={styles.ctaTitle}>{policy.callToAction.title}</span>
          <span className={styles.ctaBody}>{policy.callToAction.body}</span>
        </span>
        <LinkButton to={policy.callToAction.to} variant="inverse">
          {policy.callToAction.label}
        </LinkButton>
      </div>
    </article>
  );
}
