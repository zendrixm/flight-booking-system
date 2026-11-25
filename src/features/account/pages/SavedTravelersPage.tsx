import { useRef, useState } from 'react';

import { paths } from '@/app/paths';
import { PageLoader } from '@/components/layout';
import { Alert, Button, PageHeader, useToast } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { firstNameOf } from '@/lib/format';
import { listSavedTravelers, removeTraveler, saveTraveler } from '@/services/travelersService';
import type { SavedTraveler } from '@/types/traveler';

import { RemoveTravelerDialog } from '../components/travelers/RemoveTravelerDialog';
import { TravelerEditor } from '../components/travelers/TravelerEditor';
import { TravelerListCard } from '../components/travelers/TravelerListCard';
import {
  BLANK_PROFILE,
  EXPIRED_PASSPORT_MESSAGE,
  isProfileChanged,
  passportNote,
  passportStatus,
  profileOf,
  travelerInitials,
  travelerKindLabel,
  validateTravelerProfile,
  type StatusLabel,
  type TravelerProfile,
  type TravelerProfileErrors,
} from '../lib/travelerProfile';
import styles from './SavedTravelersPage.module.css';

const BREADCRUMBS = [
  { label: 'Home', to: paths.home },
  { label: 'Account', to: paths.trips },
  { label: 'Saved travelers' },
];

/** `null` while adding a traveler who isn't saved yet. */
type SelectedId = string | null;

function chipsFor(traveler: SavedTraveler): StatusLabel[] {
  const chips = [passportStatus(profileOf(traveler), DEMO_TODAY)];
  if (traveler.loyaltyNumber) chips.push({ label: 'Meridian Miles', tone: 'muted' });
  if (traveler.assistance !== 'None') chips.push({ label: traveler.assistance, tone: 'muted' });
  return chips;
}

export function SavedTravelersPage() {
  useDocumentTitle('Saved travelers');
  const result = useAsyncData('saved-travelers', listSavedTravelers);

  if (result.status === 'error') {
    return (
      <>
        <PageHeader title="Saved travelers" breadcrumbs={BREADCRUMBS} />
        <Alert
          tone="danger"
          role="alert"
          title="We couldn’t load your travelers"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      </>
    );
  }
  if (!result.data) return <PageLoader label="Loading saved travelers…" />;
  return <SavedTravelersManager initialTravelers={result.data} />;
}

function SavedTravelersManager({ initialTravelers }: { initialTravelers: SavedTraveler[] }) {
  const toast = useToast();
  const [travelers, setTravelers] = useState(initialTravelers);
  const [selectedId, setSelectedId] = useState<SelectedId>(initialTravelers[0]?.id ?? null);
  const [draft, setDraft] = useState<TravelerProfile>(() =>
    initialTravelers[0] ? profileOf(initialTravelers[0]) : BLANK_PROFILE,
  );
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string>();
  const editorRef = useRef<HTMLElement>(null);

  const selected = travelers.find((traveler) => traveler.id === selectedId);
  const isNew = selectedId === null;
  const original = selected ? profileOf(selected) : BLANK_PROFILE;
  const isDirty = isProfileChanged(original, draft);
  const isNameLocked = selected?.isNameLocked ?? false;
  const errors = validateTravelerProfile(draft, DEMO_TODAY, isNameLocked);
  // An expired passport is flagged straight away; everything else waits for a save attempt.
  const visibleErrors: TravelerProfileErrors = hasTriedSave
    ? errors
    : errors.passportExpiry === EXPIRED_PASSPORT_MESSAGE
      ? { passportExpiry: errors.passportExpiry }
      : {};

  const select = (traveler: SavedTraveler | undefined) => {
    setSelectedId(traveler?.id ?? null);
    setDraft(traveler ? profileOf(traveler) : BLANK_PROFILE);
    setHasTriedSave(false);
    setConfirmation(undefined);
  };

  /** On phones the editor sits below the list, so bring it into view when a traveler is picked. */
  const selectAndReveal = (traveler: SavedTraveler | undefined) => {
    select(traveler);
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (editor && editor.getBoundingClientRect().top > window.innerHeight * 0.6) {
        editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const updateDraft = (patch: Partial<TravelerProfile>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
    setConfirmation(undefined);
  };

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      setHasTriedSave(true);
      return;
    }
    setIsSaving(true);
    try {
      const base: SavedTraveler = selected ?? {
        ...BLANK_PROFILE,
        id: '',
        isAccountHolder: false,
        isNameLocked: false,
        passportCountry: draft.nationality,
      };
      const saved = await saveTraveler({ ...base, ...draft });
      setTravelers((previous) =>
        selected
          ? previous.map((traveler) => (traveler.id === saved.id ? saved : traveler))
          : [...previous, saved],
      );
      setSelectedId(saved.id);
      setDraft(profileOf(saved));
      setHasTriedSave(false);
      const firstName = firstNameOf(saved.firstNames);
      setConfirmation(
        isNew ? `${firstName} is saved and ready for checkout.` : `Changes to ${firstName} are saved.`,
      );
    } catch {
      toast.show({ tone: 'error', message: 'We couldn’t save that traveler. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await removeTraveler(selected.id);
      const remaining = travelers.filter((traveler) => traveler.id !== selected.id);
      setTravelers(remaining);
      setIsRemoveOpen(false);
      select(remaining[0]);
      setConfirmation(`${firstNameOf(selected.firstNames)} was removed from your saved travelers.`);
    } catch {
      toast.show({ tone: 'error', message: 'We couldn’t remove that traveler. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const draftName = `${draft.firstNames} ${draft.lastName}`.trim();
  const firstName = firstNameOf(draft.firstNames);

  return (
    <>
      <PageHeader
        title="Saved travelers"
        breadcrumbs={BREADCRUMBS}
        description="Add the people you travel with once, then fill them in at checkout with a tap. Passport details are encrypted."
        actions={
          <Button variant="primary" iconStart="plus" onClick={() => selectAndReveal(undefined)}>
            Add traveler
          </Button>
        }
      />

      {confirmation && (
        <Alert tone="success" role="status" icon="checkCircle">
          {confirmation}
        </Alert>
      )}

      <div className={styles.columns}>
        <ul aria-label="Travelers" className={styles.list}>
          {travelers.map((traveler) => (
            <li key={traveler.id}>
              <TravelerListCard
                name={`${traveler.firstNames} ${traveler.lastName}`}
                kind={travelerKindLabel(traveler, DEMO_TODAY)}
                initials={travelerInitials(traveler)}
                chips={chipsFor(traveler)}
                isSelected={traveler.id === selectedId}
                isAccountHolder={traveler.isAccountHolder}
                onSelect={() => selectAndReveal(traveler)}
              />
            </li>
          ))}
          {isNew && (
            <li>
              <TravelerListCard
                name={draftName || 'New traveler'}
                kind="Not saved yet"
                initials="+"
                chips={[{ label: 'Draft', tone: 'muted' }]}
                isSelected
                isDraft
                onSelect={() => undefined}
              />
            </li>
          )}
        </ul>

        <TravelerEditor
          ref={editorRef}
          heading={isNew ? 'New traveler' : `Edit ${firstName}`}
          status={
            isNew
              ? { label: 'Draft', tone: 'warning' }
              : isDirty
                ? { label: 'Unsaved changes', tone: 'warning' }
                : { label: 'Saved', tone: 'success' }
          }
          profile={draft}
          errors={visibleErrors}
          isNameLocked={isNameLocked}
          nameLockedBy={selected?.nameLockedBy}
          passportNote={passportNote(draft, DEMO_TODAY, isNew)}
          isNew={isNew}
          isDirty={isDirty}
          isSaving={isSaving}
          canRemove={Boolean(selected && !selected.isAccountHolder)}
          removeLabel={selected?.isAccountHolder ? 'Account holder can’t be removed' : undefined}
          onChange={updateDraft}
          onRemove={() => setIsRemoveOpen(true)}
          onDiscard={() => {
            setDraft(original);
            setHasTriedSave(false);
          }}
          onSave={handleSave}
        />
      </div>

      {isRemoveOpen && selected && (
        <RemoveTravelerDialog
          fullName={`${selected.firstNames} ${selected.lastName}`}
          firstName={firstNameOf(selected.firstNames)}
          initials={travelerInitials(selected)}
          isRemoving={isSaving}
          onClose={() => setIsRemoveOpen(false)}
          onConfirm={handleRemove}
        />
      )}
    </>
  );
}
