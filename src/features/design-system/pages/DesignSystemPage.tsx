import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, VelaMark } from '@/components/icons';
import { PageContainer } from '@/components/layout';
import { useDocumentTitle } from '@/hooks';

import { ComponentStatesSection } from '../components/ComponentStatesSection';
import { DsSection } from '../components/DsSection';
import { LayoutTokensSection } from '../components/LayoutTokensSection';
import { PaletteSection } from '../components/PaletteSection';
import { TypeScaleSection } from '../components/TypeScaleSection';
import styles from './DesignSystemPage.module.css';

const SURFACES = [
  {
    number: '01',
    title: 'Customer site',
    description: 'Search, results, checkout, trips and account at 48 px controls on the 24 px gap.',
    to: paths.home,
  },
  {
    number: '02',
    title: 'Phone app',
    description: 'The same tokens at phone width: 16 px gap, bottom sheets and the boarding pass.',
    to: paths.phone.search,
  },
  {
    number: '03',
    title: 'Vela Console',
    description: 'The back office in compact density: 40 px controls, tables, drawers and dialogs.',
    to: paths.console.dashboard,
  },
] as const;

/**
 * The living style guide. Every sample is drawn with the real tokens and kit components, so this
 * page can't drift from what ships.
 */
export function DesignSystemPage() {
  useDocumentTitle('Design foundations');

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <svg className={styles.globe} width="520" height="520" viewBox="0 0 520 520" aria-hidden="true">
          <g fill="none" stroke="currentColor">
            <circle cx="260" cy="260" r="240" />
            <ellipse cx="260" cy="260" rx="160" ry="240" />
            <ellipse cx="260" cy="260" rx="60" ry="240" />
            <ellipse cx="260" cy="260" rx="240" ry="50" />
          </g>
        </svg>
        <span className={styles.mark}>
          <VelaMark size={40} />
        </span>
        <PageContainer layout="plain" className={styles.heroContent}>
          <span className={styles.eyebrow}>Vela design foundations · v1.0</span>
          <h1 className={styles.title}>
            Five colors. <em className={styles.emphasis}>Every state is one of them,</em> at a different
            opacity.
          </h1>
          <p className={styles.intro}>
            The same tokens drive the customer site, the mobile app and the back office. Hover, disabled,
            read-only, dividers and tints are never new colors — only opacity steps of the five below.
          </p>
        </PageContainer>
      </header>

      <PageContainer as="main" layout="plain" className={styles.content}>
        <DsSection
          eyebrow="In use"
          title="One system, three surfaces"
          aside="Tokens live in src/styles/tokens.css and the kit in src/components/ui. Open a surface to see every state in context."
        >
          <ul className={styles.surfaces}>
            {SURFACES.map((surface) => (
              <li key={surface.to}>
                <Link to={surface.to} className={styles.surface}>
                  <span className={styles.surfaceTop}>
                    <span className={styles.surfaceNumber}>{surface.number}</span>
                    <Icon name="arrowRight" size={16} />
                  </span>
                  <span className={styles.surfaceTitle}>{surface.title}</span>
                  <span className={styles.surfaceDescription}>{surface.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </DsSection>
        <PaletteSection />
        <TypeScaleSection />
        <ComponentStatesSection />
        <LayoutTokensSection />
      </PageContainer>
    </div>
  );
}
