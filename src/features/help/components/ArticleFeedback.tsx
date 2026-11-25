import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, TextAreaField } from '@/components/ui';
import { sendArticleFeedback } from '@/services/helpService';

import { useHelpSupport } from '../state/helpSupportContext';
import styles from './ArticleFeedback.module.css';

const REASONS = [
  { id: 'missing', label: 'It didn’t answer my question' },
  { id: 'unclear', label: 'It’s hard to follow' },
  { id: 'wrong', label: 'The information is wrong' },
  { id: 'outdated', label: 'It’s out of date' },
] as const;

type FeedbackStep = 'ask' | 'reason' | 'thanksHelpful' | 'thanksNotHelpful';

interface ArticleFeedbackProps {
  articleId: string;
  helpfulNote: string;
}

/** "Was this article helpful?" — a "No" asks what went wrong, for the content team. */
export function ArticleFeedback({ articleId, helpfulNote }: ArticleFeedbackProps) {
  const { openChat } = useHelpSupport();
  const [step, setStep] = useState<FeedbackStep>('ask');
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState('');
  const [hasTried, setHasTried] = useState(false);

  const submitReason = async () => {
    if (!reason) {
      setHasTried(true);
      return;
    }
    await sendArticleFeedback(articleId, { isHelpful: false, reason, note: note.trim() });
    setStep('thanksNotHelpful');
  };

  return (
    <section aria-labelledby="feedback-title" className={styles.feedback}>
      {step === 'ask' && (
        <div className={styles.ask}>
          <span className={styles.text}>
            <span id="feedback-title" className={styles.title}>
              Was this article helpful?
            </span>
            <span className={styles.muted}>{helpfulNote}</span>
          </span>
          <span className={styles.buttons}>
            <Button
              variant="quiet"
              onClick={() => {
                void sendArticleFeedback(articleId, { isHelpful: true });
                setStep('thanksHelpful');
              }}
            >
              Yes
            </Button>
            <Button variant="quiet" onClick={() => setStep('reason')}>
              No
            </Button>
          </span>
        </div>
      )}

      {step === 'reason' && (
        <form
          className={styles.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submitReason();
          }}
        >
          <span className={styles.text}>
            <span id="feedback-title" className={styles.title}>
              Sorry about that. What went wrong?
            </span>
            <span className={styles.muted}>
              Your feedback goes to the team that writes these articles. It isn’t a support request.
            </span>
          </span>
          <fieldset className={styles.reasons}>
            <legend className="visually-hidden">What went wrong?</legend>
            {REASONS.map((option) => (
              <label key={option.id} className={hasTried && !reason ? styles.reasonInvalid : styles.reason}>
                <input
                  type="radio"
                  name={`feedback-reason-${articleId}`}
                  className="visually-hidden"
                  checked={reason === option.id}
                  onChange={() => setReason(option.id)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          {hasTried && !reason && (
            <span role="alert" className={styles.error}>
              Choose what went wrong so we know what to fix.
            </span>
          )}
          <TextAreaField
            label="What were you hoping to find?"
            rows={3}
            maxLength={500}
            placeholder="e.g. Whether I can change only the return flight"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className={styles.formActions}>
            <Button variant="quiet" onClick={() => setStep('ask')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send feedback
            </Button>
          </div>
        </form>
      )}

      {(step === 'thanksHelpful' || step === 'thanksNotHelpful') && (
        <div role="status" className={styles.thanks}>
          <span className={styles.thanksIcon} aria-hidden="true">
            <Icon name="check" size={18} strokeWidth={2.4} />
          </span>
          <span className={styles.text}>
            <span id="feedback-title" className={styles.title}>
              {step === 'thanksHelpful'
                ? 'Thanks — glad it helped'
                : 'Thanks — we’ll use this to fix the article'}
            </span>
            <span className={styles.muted}>
              {step === 'thanksHelpful'
                ? 'Have a good trip, and come back any time.'
                : 'If you still need an answer, a specialist can help right now.'}
            </span>
          </span>
          {step === 'thanksNotHelpful' && (
            <Button variant="primary" onClick={openChat}>
              Chat with us
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
