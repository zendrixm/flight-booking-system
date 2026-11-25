import type { ReactNode } from 'react';

import { PageHeader, type BreadcrumbItem } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { navGroupOf, type ConsoleSection } from '@/layouts/console/consoleNavigation';

import styles from './ConsolePage.module.css';

interface ConsolePageProps {
  section: ConsoleSection;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Replaces the default "Group › Page" trail, e.g. for a record inside a section. */
  breadcrumbs?: BreadcrumbItem[];
  /** Browser tab title when it should differ from `title`. */
  documentTitle?: string;
  children: ReactNode;
}

/** The main region of a console page: breadcrumb, serif title, actions, then the page's panels. */
export function ConsolePage({
  section,
  title,
  description,
  actions,
  breadcrumbs,
  documentTitle,
  children,
}: ConsolePageProps) {
  useDocumentTitle(`${documentTitle ?? title} · Vela Console`);
  const group = navGroupOf(section);
  const trail = breadcrumbs ?? [...(group ? [{ label: group.label }] : []), { label: title }];

  return (
    <main className={styles.page}>
      <PageHeader
        variant="console"
        title={title}
        breadcrumbs={trail}
        description={description}
        actions={actions}
      />
      {children}
    </main>
  );
}
