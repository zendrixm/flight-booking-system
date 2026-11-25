import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';

import { paths } from '@/app/paths';
import { PageContainer } from '@/components/layout';
import { Breadcrumbs, Button, Tabs, useToast } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { downloadLegalDocument } from '@/services/legalService';
import type { LegalDocumentId } from '@/types/legal';

import { LegalArticle } from '../components/LegalArticle';
import { LegalSidebar } from '../components/LegalSidebar';
import { LEGAL_DOCUMENT_ORDER, LEGAL_DOCUMENTS } from '../content/legalDocuments';
import { isLegalDocumentId } from '../lib/legalDocumentId';
import styles from './LegalPage.module.css';

const BREADCRUMBS = [{ label: 'Home', to: paths.home }, { label: 'Legal' }];
const TAB_ITEMS = LEGAL_DOCUMENT_ORDER.map((id) => ({ id, label: LEGAL_DOCUMENTS[id].label }));

/** /legal/:document — terms of carriage, terms of service, privacy notice and cookie policy. */
export function LegalPage() {
  const { document: documentParam } = useParams();
  if (documentParam !== undefined && !isLegalDocumentId(documentParam)) {
    return <Navigate to={paths.legal()} replace />;
  }
  return <LegalView documentId={documentParam ?? 'carriage'} />;
}

function LegalView({ documentId }: { documentId: LegalDocumentId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const policy = LEGAL_DOCUMENTS[documentId];
  useDocumentTitle(policy.title);

  const download = async () => {
    setIsDownloading(true);
    try {
      const { fileName } = await downloadLegalDocument(documentId);
      toast.show({ tone: 'success', message: `Downloaded ${fileName}` });
    } catch {
      toast.show({ tone: 'error', message: 'The download didn’t start. Try again.' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageContainer as="main" layout="stack">
      <div className={styles.header}>
        <div className={styles.intro}>
          <Breadcrumbs items={BREADCRUMBS} className={styles.breadcrumbs} />
          <span className={styles.eyebrow}>
            <span className={styles.rule} aria-hidden="true" />
            Terms &amp; policies
          </span>
          <h1 className={styles.title}>
            The fine print, <em>in plain words</em>
          </h1>
          <p className={styles.lead}>
            Each policy opens with a short summary. The full text is what applies if there’s ever a
            disagreement.
          </p>
        </div>
        <Button variant="quiet" iconStart="download" loading={isDownloading} onClick={download}>
          Download PDF
        </Button>
      </div>

      <Tabs
        label="Policies"
        items={TAB_ITEMS}
        value={documentId}
        onChange={(id) => navigate(paths.legal(id), { preventScrollReset: true })}
      >
        <div className={styles.layout}>
          <LegalSidebar sections={policy.sections} />
          {/* Keyed so the cookie choices and scroll position start fresh for each document. */}
          <LegalArticle key={documentId} policy={policy} />
        </div>
      </Tabs>
    </PageContainer>
  );
}
