import {
  CALLBACK_SLOTS,
  CHAT_QUICK_REPLIES,
  HELP_ARTICLES,
  HELP_TOPICS,
  TRACKED_REFUNDS,
} from '@/mocks/helpCentre';
import type {
  CallbackRequest,
  CallbackSlot,
  HelpArticle,
  HelpTopic,
  RefundStatus,
  SupportMessage,
} from '@/types/help';

import { mockRequest } from './mockApi';

let nextCase = 48213;

export function listHelpTopics(): readonly HelpTopic[] {
  return HELP_TOPICS;
}

export function listHelpArticles(): readonly HelpArticle[] {
  return HELP_ARTICLES;
}

export function findHelpArticle(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.id === id);
}

/** A refund for a booking reference and last name, or `null` when nothing matches. */
export function trackRefund(reference: string, lastName: string): Promise<RefundStatus | null> {
  return mockRequest(() => {
    const refund = TRACKED_REFUNDS[reference.trim().toUpperCase()];
    return refund && refund.lastName === lastName.trim().toLowerCase() ? refund : null;
  });
}

// Parameters prefixed with `_` are what the real API receives; the mock doesn't need them.

/** Opens a support case and returns its number, e.g. "VC-48213". */
export function sendSupportMessage(_message: SupportMessage): Promise<{ caseNumber: string }> {
  return mockRequest(() => ({ caseNumber: `VC-${nextCase++}` }));
}

export function listCallbackSlots(): readonly CallbackSlot[] {
  return CALLBACK_SLOTS;
}

export function requestCallback(_request: CallbackRequest): Promise<{ caseNumber: string }> {
  return mockRequest(() => ({ caseNumber: `VC-${nextCase++}` }));
}

/** Feedback on an article goes to the content team; it isn't a support request. */
export function sendArticleFeedback(
  _articleId: string,
  _feedback: { isHelpful: boolean; reason?: string; note?: string },
): Promise<void> {
  return mockRequest(() => undefined);
}

const FALLBACK_REPLY = 'Thanks — I’m looking into that now. It may take a minute.';

/** The agent's reply to a chat message. */
export function sendChatMessage(text: string): Promise<string> {
  return mockRequest(() => CHAT_QUICK_REPLIES[text] ?? FALLBACK_REPLY, 900);
}
