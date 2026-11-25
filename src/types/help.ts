import type { IconName } from '@/components/icons';

export type HelpTopicId = 'bookings' | 'payments' | 'baggage' | 'checkin' | 'documents' | 'account';

export interface HelpLink {
  label: string;
  to: string;
}

export interface HelpTopic {
  id: HelpTopicId;
  label: string;
  icon: IconName;
  description: string;
  /** The self-service action most people in this topic need. */
  action: HelpLink;
}

/** A row in a comparison table, e.g. fare → change fee → note. */
export interface HelpTableRow {
  label: string;
  value: string;
  note: string;
}

export interface HelpArticleDetails {
  updatedOn: string;
  readingMinutes: number;
  helpfulNote: string;
  table?: { title: string; rows: HelpTableRow[] };
  steps?: Array<{ title: string; detail: string }>;
  tips?: string[];
}

export interface HelpArticle {
  id: string;
  topicId: HelpTopicId;
  question: string;
  answer: string;
  link?: HelpLink;
  /** Long-form content; short answers only have the summary. */
  details?: HelpArticleDetails;
}

export interface TravelAdvisory {
  title: string;
  detail: string;
  action: HelpLink;
}

export interface RefundStep {
  title: string;
  detail: string;
  isDone: boolean;
}

export interface RefundStatus {
  reference: string;
  summary: string;
  amount: number;
  statusLabel: string;
  steps: RefundStep[];
}

export type SupportTopic = 'change' | 'refund' | 'receipt' | 'baggage' | 'checkin' | 'other';

export interface SupportMessage {
  topic: SupportTopic;
  bookingReference: string;
  replyTo: string;
  body: string;
  attachments: Array<{ name: string; size: number }>;
}

export interface CallbackSlot {
  id: string;
  dayLabel: string;
  time: string;
}

export interface CallbackRequest {
  phoneNumber: string;
  topic: SupportTopic;
  bookingReference: string;
  /** `null` means as soon as possible. */
  slotId: string | null;
}

export interface ChatMessage {
  id: string;
  from: 'traveler' | 'agent';
  text: string;
}
