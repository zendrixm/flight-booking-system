import { createContext, useContext } from 'react';

import type { SupportTopic } from '@/types/help';

export interface MessagePrefill {
  topic?: SupportTopic;
  bookingReference?: string;
}

export interface HelpSupportValue {
  openChat: () => void;
  openMessage: (prefill?: MessagePrefill) => void;
  openCallback: () => void;
  /** e.g. "We’ll call +63 917 ••• 0123 within 15 minutes", once a call back is booked. */
  callbackSummary: string | null;
}

export const HelpSupportContext = createContext<HelpSupportValue | null>(null);

/** Opens chat, the message form or a call back from anywhere in the help centre. */
export function useHelpSupport(): HelpSupportValue {
  const value = useContext(HelpSupportContext);
  if (!value) throw new Error('useHelpSupport must be used inside <HelpSupportProvider>.');
  return value;
}
