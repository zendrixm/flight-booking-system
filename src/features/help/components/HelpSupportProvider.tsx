import { useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { HelpSupportContext, type HelpSupportValue, type MessagePrefill } from '../state/helpSupportContext';
import { CallbackDialog } from './CallbackDialog';
import { ChatPanel } from './ChatPanel';
import { MessageDialog } from './MessageDialog';

type SupportDialog = { kind: 'message'; prefill?: MessagePrefill } | { kind: 'callback' } | null;

/**
 * Chat, "write to us" and call backs for the help centre. `#chat` and `#message` in the URL open
 * them directly, so other pages can link straight to a person.
 */
export function HelpSupportProvider({ children }: { children: ReactNode }) {
  const { hash } = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(hash === '#chat');
  const [dialog, setDialog] = useState<SupportDialog>(hash === '#message' ? { kind: 'message' } : null);
  const [callbackSummary, setCallbackSummary] = useState<string | null>(null);

  const value = useMemo<HelpSupportValue>(
    () => ({
      openChat: () => {
        setDialog(null);
        setIsChatOpen(true);
      },
      openMessage: (prefill) => setDialog({ kind: 'message', prefill }),
      openCallback: () => setDialog({ kind: 'callback' }),
      callbackSummary,
    }),
    [callbackSummary],
  );

  return (
    <HelpSupportContext.Provider value={value}>
      {children}
      <ChatPanel
        isOpen={isChatOpen}
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)}
      />
      {dialog?.kind === 'message' && (
        <MessageDialog
          prefill={dialog.prefill}
          onClose={() => setDialog(null)}
          onOpenChat={() => {
            setDialog(null);
            setIsChatOpen(true);
          }}
        />
      )}
      {dialog?.kind === 'callback' && (
        <CallbackDialog
          onClose={() => setDialog(null)}
          onRequested={(summary) => setCallbackSummary(summary)}
        />
      )}
    </HelpSupportContext.Provider>
  );
}
