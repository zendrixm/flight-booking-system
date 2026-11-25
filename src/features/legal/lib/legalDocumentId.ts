import type { LegalDocumentId } from '@/types/legal';

import { LEGAL_DOCUMENT_ORDER } from '../content/legalDocuments';

export function isLegalDocumentId(value: string | undefined): value is LegalDocumentId {
  return LEGAL_DOCUMENT_ORDER.some((id) => id === value);
}
