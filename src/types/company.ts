export interface OpenRole {
  id: string;
  title: string;
  team: string;
  /** "Makati City · hybrid" */
  location: string;
}

export interface JobApplication {
  roleId: string;
  fullName: string;
  email: string;
  /** Portfolio or LinkedIn; optional. */
  link: string;
  message: string;
}

export type PartnerKind = 'airline' | 'hotel' | 'corporate' | 'media';

export interface PartnerEnquiry {
  fullName: string;
  email: string;
  company: string;
  kind: PartnerKind;
  message: string;
}

export interface PressAsset {
  id: string;
  name: string;
  /** "SVG and PNG · light and dark · 2.1 MB" */
  description: string;
  fileName: string;
}
