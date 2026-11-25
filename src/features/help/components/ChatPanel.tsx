import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui';
import { useEscapeKey } from '@/hooks';
import { CHAT_AGENT, CHAT_QUICK_REPLIES } from '@/mocks/helpCentre';
import { sendChatMessage } from '@/services/helpService';
import type { ChatMessage } from '@/types/help';

import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

let nextMessageId = 1;
const message = (from: ChatMessage['from'], text: string): ChatMessage => ({
  id: `msg-${nextMessageId++}`,
  from,
  text,
});

/**
 * A floating chat window. It isn't modal, so people can keep reading articles while they chat;
 * Escape closes it and focus returns to the launcher.
 */
export function ChatPanel({ isOpen, onOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [message('agent', CHAT_AGENT.greeting)]);
  const [draft, setDraft] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(isOpen);

  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, isAgentTyping]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((previous) => [...previous, message('traveler', trimmed)]);
    setDraft('');
    setIsAgentTyping(true);
    try {
      const reply = await sendChatMessage(trimmed);
      setMessages((previous) => [...previous, message('agent', reply)]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button ref={launcherRef} type="button" className={styles.launcher} onClick={onOpen}>
        <Icon name="messageCircle" size={20} strokeWidth={1.8} />
        Chat with us
      </button>
    );
  }

  return (
    <div role="dialog" aria-label="Chat with Vela support" className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {CHAT_AGENT.initials}
          <span className={styles.online} />
        </span>
        <span className={styles.agent}>
          <span className={styles.agentName}>{CHAT_AGENT.name} · Vela support</span>
          <span className={styles.agentStatus}>Usually replies in about 2 minutes</span>
        </span>
        <IconButton icon="close" label="Close chat" variant="inverse" onClick={onClose} />
      </div>
      <div ref={logRef} role="log" aria-live="polite" className={styles.log}>
        {messages.map((entry) => (
          <div key={entry.id} className={entry.from === 'traveler' ? styles.rowMine : styles.row}>
            <span className={entry.from === 'traveler' ? styles.bubbleMine : styles.bubble}>
              <span className="visually-hidden">
                {entry.from === 'traveler' ? 'You: ' : `${CHAT_AGENT.name}: `}
              </span>
              {entry.text}
            </span>
          </div>
        ))}
        {isAgentTyping && (
          <div className={styles.row}>
            <span className={styles.typing}>{CHAT_AGENT.name} is typing…</span>
          </div>
        )}
      </div>
      <div className={styles.quickReplies}>
        {Object.keys(CHAT_QUICK_REPLIES).map((reply) => (
          <button key={reply} type="button" className={styles.quickReply} onClick={() => send(reply)}>
            {reply}
          </button>
        ))}
      </div>
      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          aria-label="Message"
          placeholder="Type a message"
          className={styles.input}
          onChange={(event) => setDraft(event.target.value)}
        />
        <IconButton
          type="submit"
          icon="arrowUpRight"
          label="Send message"
          variant="soft"
          disabled={!draft.trim()}
        />
      </form>
    </div>
  );
}
