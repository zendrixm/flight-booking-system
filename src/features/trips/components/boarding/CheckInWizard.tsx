import clsx from 'clsx';
import { useReducer, useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Button } from '@/components/ui';
import type { BoardingPass } from '@/types/boardingPass';

import {
  canContinue,
  CHECK_IN_STEPS,
  checkInReducer,
  currentStepId,
  initialCheckInDraft,
  LAST_STEP_INDEX,
  stepHint,
} from '../../lib/checkInWizard';
import { RestrictedItemsDialog } from './BoardingDialogs';
import { DeclarationStep, DocumentsStep, SeatStep, TravelerStep } from './CheckInSteps';
import styles from './CheckInWizard.module.css';

interface CheckInWizardProps {
  pass: BoardingPass;
  isSubmitting: boolean;
  onCheckIn: (seat: string) => void;
}

/** Travelers → documents → restricted items → seat, then the boarding pass is issued. */
export function CheckInWizard({ pass, isSubmitting, onCheckIn }: CheckInWizardProps) {
  const [draft, dispatch] = useReducer(checkInReducer, pass.seat, initialCheckInDraft);
  const [isRestrictedListOpen, setIsRestrictedListOpen] = useState(false);
  const stepId = currentStepId(draft);
  const isLastStep = draft.stepIndex === LAST_STEP_INDEX;
  const isReady = canContinue(draft);
  const hint = stepHint(draft);

  const handleContinue = () => {
    if (isLastStep) onCheckIn(draft.seat);
    else dispatch({ type: 'next' });
  };

  return (
    <div className={styles.wizard}>
      <ol aria-label="Check-in steps" className={styles.progress}>
        {CHECK_IN_STEPS.map((step, index) => {
          const isDone = index < draft.stepIndex;
          const isCurrent = index === draft.stepIndex;
          const label = `${index + 1} · ${step.label}`;
          return (
            <li key={step.id} aria-current={isCurrent ? 'step' : undefined} className={styles.progressItem}>
              <span
                aria-hidden="true"
                className={clsx(styles.bar, isDone && styles.barDone, isCurrent && styles.barCurrent)}
              />
              {isDone ? (
                <button
                  type="button"
                  className={styles.doneLabel}
                  onClick={() => dispatch({ type: 'goTo', stepIndex: index })}
                >
                  {label}
                  <span className="visually-hidden">, done</span>
                </button>
              ) : (
                <span className={isCurrent ? styles.currentLabel : styles.upcomingLabel}>{label}</span>
              )}
            </li>
          );
        })}
      </ol>

      {stepId === 'travelers' && (
        <TravelerStep
          pass={pass}
          isIncluded={draft.isTravelerIncluded}
          showError={!draft.isTravelerIncluded && draft.hasToggledTraveler}
          onToggle={() => dispatch({ type: 'toggleTraveler' })}
        />
      )}
      {stepId === 'documents' && (
        <DocumentsStep
          pass={pass}
          isConfirmed={draft.areDocumentsConfirmed}
          onToggle={() => dispatch({ type: 'toggleDocuments' })}
        />
      )}
      {stepId === 'restrictedItems' && (
        <DeclarationStep
          pass={pass}
          declaration={draft.declaration}
          onDeclare={(declaration) => dispatch({ type: 'declare', declaration })}
          onShowFullList={() => setIsRestrictedListOpen(true)}
        />
      )}
      {stepId === 'seat' && (
        <SeatStep pass={pass} seat={draft.seat} onPickSeat={(seat) => dispatch({ type: 'pickSeat', seat })} />
      )}

      <div className={styles.actions}>
        {draft.stepIndex > 0 ? (
          <Button
            variant="secondary"
            size="large"
            iconStart="chevronLeft"
            onClick={() => dispatch({ type: 'back' })}
          >
            Back
          </Button>
        ) : (
          <Link to={paths.trips} className={styles.notNow}>
            Not now
          </Link>
        )}
        <div className={styles.forward}>
          <Button
            variant="primary"
            size="large"
            disabled={!isReady}
            loading={isSubmitting}
            onClick={handleContinue}
          >
            {isLastStep ? `Check in ${pass.passenger.firstName}` : 'Continue'}
          </Button>
          <span role="status" className={hint.isProblem ? styles.hintProblem : styles.hint}>
            {hint.text}
          </span>
        </div>
      </div>

      {isRestrictedListOpen && (
        <RestrictedItemsDialog
          pass={pass}
          onClose={() => setIsRestrictedListOpen(false)}
          onConfirm={() => {
            dispatch({ type: 'declare', declaration: 'none' });
            setIsRestrictedListOpen(false);
          }}
        />
      )}
    </div>
  );
}
