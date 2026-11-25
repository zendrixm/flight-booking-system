import { Link } from 'react-router';

import { paths } from '@/app/paths';
import type { LegalSection } from '@/types/legal';

import styles from './LegalSidebar.module.css';

interface LegalSidebarProps {
  sections: readonly LegalSection[];
}

/** "On this page" links, plus a way to ask about a policy. Becomes a row of chips on small screens. */
export function LegalSidebar({ sections }: LegalSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav aria-labelledby="legal-toc-heading" className={styles.toc}>
        <span id="legal-toc-heading" className={styles.tocTitle}>
          On this page
        </span>
        <ol className={styles.tocList}>
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className={styles.tocLink}>
                <span className={styles.tocNumber} aria-hidden="true">
                  {sectionNumber(index)}
                </span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.help}>
        <span className={styles.helpTitle}>Questions about a policy?</span>
        <span className={styles.helpText}>Our team answers in English or Filipino, 24 hours a day.</span>
        <Link to={`${paths.help}#message`} className={styles.helpLink}>
          Write to us
        </Link>
      </div>
    </aside>
  );
}

/** "01", "02"… */
export function sectionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
