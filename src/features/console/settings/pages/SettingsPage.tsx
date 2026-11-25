import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { useStaffSession } from '@/app/providers/staffSessionContext';
import { PageLoader } from '@/components/layout';
import { Alert, Button, Tabs, useToast } from '@/components/ui';
import { useAsyncData, useUrlQuery } from '@/hooks';
import * as settingsActions from '@/services/console/settingsService';
import { ApiError } from '@/services/mockApi';
import type {
  SettingsOverview,
  SettingsResult,
  SettingsSection,
  SettingsTab,
} from '@/types/console/settings';

import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { ConsolePage } from '../../shared/components/ConsolePage';
import { UnsavedChangesBar } from '../../shared/components/UnsavedChangesBar';
import { GeneralSettingsPanel } from '../components/GeneralSettingsPanel';
import { IntegrationSettingsPanel } from '../components/IntegrationSettingsPanel';
import { NotificationSettingsPanel } from '../components/NotificationSettingsPanel';
import { PaymentSettingsPanel } from '../components/PaymentSettingsPanel';
import { SecuritySettingsPanel } from '../components/SecuritySettingsPanel';
import {
  changeCounts,
  draftErrors,
  fromDraft,
  sectionsWithErrors,
  securityRisks,
  SETTINGS_TABS,
  tabFromParam,
  tabLabel,
  toDraft,
  type SettingsDraft,
} from '../lib/settingsForm';
import styles from './SettingsPage.module.css';

const PAGE_TITLE = 'Settings';
/** Time to read "signing you out" before leaving the console. */
const SIGN_OUT_DELAY_MS = 1400;

export function SettingsPage() {
  const overview = useAsyncData('settings', settingsActions.getSettings);

  if (!overview.data) {
    if (overview.status !== 'error') return <PageLoader label="Loading settings…" />;
    return (
      <ConsolePage section="settings" title={PAGE_TITLE}>
        <Alert
          tone="danger"
          role="alert"
          title="Settings didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={overview.reload}>
              Try again
            </Button>
          }
        />
      </ConsolePage>
    );
  }
  return <SettingsView overview={overview.data} onOverviewChange={overview.mutate} />;
}

type BusyAction = 'save' | 'settlement' | 'testAlert' | 'export' | null;

interface SettingsViewProps {
  overview: SettingsOverview;
  onOverviewChange: (overview: SettingsOverview) => void;
}

function SettingsView({ overview, onOverviewChange }: SettingsViewProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const { staff, signOut } = useStaffSession();
  const [searchParams, updateQuery] = useUrlQuery();
  const [draft, setDraft] = useState<SettingsDraft>(() => toDraft(overview.settings));
  const [confirm, setConfirm] = useState<'discard' | 'risk' | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const signOutTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(signOutTimer.current), []);

  const tab = tabFromParam(searchParams.get('tab'));
  const saved = toDraft(overview.settings);
  const errors = draftErrors(draft);
  const counts = changeCounts(saved, draft);
  const totalChanges = Object.values(counts).reduce((total, count) => total + count, 0);
  const changedSections = (Object.keys(counts) as SettingsSection[]).filter((section) => counts[section] > 0);
  const errorSections = sectionsWithErrors(errors);
  const errorCount = Object.keys(errors).length;
  const risks = securityRisks(saved.security, draft.security, overview);

  const editSection = <K extends SettingsSection>(section: K, change: Partial<SettingsDraft[K]>) =>
    setDraft((current) => ({ ...current, [section]: { ...current[section], ...change } }));

  /** Runs an immediate action (integrations, requests) and announces the result. */
  const run = async (task: () => Promise<SettingsResult>, busy: BusyAction = null) => {
    setBusyAction(busy);
    try {
      const result = await task();
      onOverviewChange(result.overview);
      toast.show({ tone: result.tone ?? 'success', message: result.message });
      return true;
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'That didn’t go through. Try again.',
      });
      return false;
    } finally {
      setBusyAction(null);
    }
  };

  const save = async () => {
    setConfirm(null);
    setBusyAction('save');
    try {
      const result = await settingsActions.saveSettings(fromDraft(draft), changedSections.map(tabLabel));
      onOverviewChange(result.overview);
      setDraft(toDraft(result.overview.settings));
      toast.show({ tone: result.tone ?? 'success', message: result.message });
      if (result.signsYouOut) {
        signOutTimer.current = window.setTimeout(() => {
          navigate(paths.console.login, { replace: true });
          signOut();
        }, SIGN_OUT_DELAY_MS);
      }
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Settings weren’t saved. Try again.',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const requestSave = () => {
    if (errorCount) return;
    if (risks.length) setConfirm('risk');
    else void save();
  };

  const dirtyDetail = errorCount
    ? `Fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} in ${errorSections.map(tabLabel).join(' and ')} to save`
    : `${totalChanges} ${totalChanges === 1 ? 'change' : 'changes'} · ${changedSections.map(tabLabel).join(', ')}`;

  return (
    <ConsolePage
      section="settings"
      title={PAGE_TITLE}
      description={`${overview.settings.general.workspaceName} workspace · every change is recorded in the audit log`}
      actions={<span className={styles.lastSaved}>{overview.lastSaved}</span>}
    >
      <Tabs<SettingsTab>
        label="Settings sections"
        items={SETTINGS_TABS.map((item) => ({
          ...item,
          marker:
            item.id !== 'integrations' && (counts[item.id] > 0 || errorSections.includes(item.id))
              ? 'has unsaved changes'
              : undefined,
        }))}
        value={tab}
        onChange={(next) => updateQuery((params) => params.set('tab', next))}
      >
        <div className={styles.panel}>
          {tab === 'general' && (
            <GeneralSettingsPanel
              draft={draft.general}
              savedLogo={overview.settings.general.logo}
              logoUpdated={overview.logoUpdated}
              errors={errors}
              onChange={(change) => editSection('general', change)}
              onDownloadLogo={(fileName) =>
                toast.show({ tone: 'success', message: `Downloading ${fileName} and PNG versions` })
              }
            />
          )}
          {tab === 'payments' && (
            <PaymentSettingsPanel
              draft={draft.payments}
              overview={overview}
              errors={errors}
              isBusy={busyAction === 'settlement'}
              onChange={(change) => editSection('payments', change)}
              onRequestSettlementChange={(reason) =>
                run(() => settingsActions.requestSettlementChange(reason), 'settlement')
              }
            />
          )}
          {tab === 'notifications' && (
            <NotificationSettingsPanel
              draft={draft.notifications}
              refundTargetHours={draft.payments.refundTargetHours}
              timeZone={draft.general.timeZone}
              isSendingTest={busyAction === 'testAlert'}
              onChange={(change) => editSection('notifications', change)}
              onSendTest={() => void run(settingsActions.sendTestAlert, 'testAlert')}
            />
          )}
          {tab === 'integrations' && (
            <IntegrationSettingsPanel overview={overview} run={(task) => run(task)} />
          )}
          {tab === 'security' && (
            <SecuritySettingsPanel
              draft={draft.security}
              overview={overview}
              staffName={staff?.fullName ?? 'you'}
              isExporting={busyAction === 'export'}
              onChange={(change) => editSection('security', change)}
              onExportAudit={(actor) => void run(() => settingsActions.exportSettingsAudit(actor), 'export')}
            />
          )}

          {(totalChanges > 0 || errorCount > 0) && (
            <UnsavedChangesBar
              sticky
              hasErrors={errorCount > 0}
              title="You have unsaved changes"
              description={dirtyDetail}
              actions={
                <>
                  <Button variant="quiet" aria-haspopup="dialog" onClick={() => setConfirm('discard')}>
                    Discard
                  </Button>
                  <Button
                    variant="primary"
                    disabled={errorCount > 0}
                    loading={busyAction === 'save'}
                    onClick={requestSave}
                  >
                    Save changes
                  </Button>
                </>
              }
            />
          )}
        </div>
      </Tabs>

      <ConfirmDialog
        content={
          confirm === 'discard'
            ? {
                role: 'alertdialog',
                title: 'Discard unsaved changes?',
                subtitle: `${totalChanges} ${totalChanges === 1 ? 'change' : 'changes'} in ${changedSections.map(tabLabel).join(', ')}`,
                body: 'Every setting goes back to how it was last saved. Nothing has been applied yet, so customers and staff won’t notice a thing.',
                cancelLabel: 'Keep editing',
                confirmLabel: 'Discard changes',
                isDestructive: true,
              }
            : confirm === 'risk'
              ? {
                  role: 'alertdialog',
                  title: 'Save these security changes?',
                  subtitle: `Applies to all ${overview.activeStaffCount} staff as soon as you save`,
                  body: 'Some of these changes make the console easier to break into or can lock people out. They’re saved to the audit log under your name.',
                  cancelLabel: 'Review changes',
                  confirmLabel: 'Save anyway',
                  isDestructive: true,
                }
              : null
        }
        isBusy={busyAction === 'save'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === 'discard') {
            setDraft(saved);
            setConfirm(null);
          } else void save();
        }}
      >
        {confirm === 'risk' && (
          <ul className={styles.risks}>
            {risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        )}
      </ConfirmDialog>
    </ConsolePage>
  );
}
