import { useState } from 'react';

import { Icon } from '@/components/icons';
import { PageLoader } from '@/components/layout';
import { Alert, Button, Dialog, TextAreaField, TextField } from '@/components/ui';
import { pluralize } from '@/lib/format';
import { applyForRole } from '@/services/companyService';
import { ApiError } from '@/services/mockApi';
import type { OpenRole } from '@/types/company';

import { applicationErrors, BLANK_APPLICATION, type ApplicationForm } from '../../lib/contactForms';
import styles from './AboutDialogs.module.css';
import { ContactFields } from './ContactFields';
import { SentDialog } from './SentDialog';

type CareersStep =
  { kind: 'roles' } | { kind: 'apply'; role: OpenRole } | { kind: 'sent'; role: OpenRole; email: string };

interface CareersDialogProps {
  /** Undefined while the roles are loading. */
  roles: OpenRole[] | undefined;
  onClose: () => void;
}

const roleMeta = (role: OpenRole) => `${role.team} · ${role.location}`;

/** Open roles, then the application for the one picked, then a thank-you. */
export function CareersDialog({ roles, onClose }: CareersDialogProps) {
  const [step, setStep] = useState<CareersStep>({ kind: 'roles' });

  if (step.kind === 'sent') {
    return (
      <SentDialog
        message={`Your application for ${step.role.title} is in. We’ll email ${step.email} within 10 working days.`}
        onClose={onClose}
      />
    );
  }

  if (step.kind === 'apply') {
    return (
      <ApplicationDialog
        role={step.role}
        onBack={() => setStep({ kind: 'roles' })}
        onClose={onClose}
        onSent={(email) => setStep({ kind: 'sent', role: step.role, email })}
      />
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Open roles"
      description={
        roles && `${pluralize(roles.length, 'role')} · we reply to every application within 10 working days.`
      }
    >
      {roles ? (
        <ul className={styles.list}>
          {roles.map((role) => (
            <li key={role.id}>
              <button
                type="button"
                className={styles.roleButton}
                onClick={() => setStep({ kind: 'apply', role })}
              >
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{role.title}</span>
                  <span className={styles.rowMeta}>{roleMeta(role)}</span>
                </span>
                <Icon name="chevronRight" size={18} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <PageLoader label="Loading open roles…" />
      )}
    </Dialog>
  );
}

interface ApplicationDialogProps {
  role: OpenRole;
  onBack: () => void;
  onClose: () => void;
  onSent: (email: string) => void;
}

function ApplicationDialog({ role, onBack, onClose, onSent }: ApplicationDialogProps) {
  const [form, setForm] = useState<ApplicationForm>(BLANK_APPLICATION);
  const [hasTried, setHasTried] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string>();

  const errors = applicationErrors(form);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const update = (patch: Partial<ApplicationForm>) => setForm((previous) => ({ ...previous, ...patch }));

  const send = async () => {
    if (Object.keys(errors).length > 0) {
      setHasTried(true);
      return;
    }
    setIsSending(true);
    setSendError(undefined);
    try {
      const email = form.email.trim();
      await applyForRole({
        roleId: role.id,
        fullName: form.fullName.trim(),
        email,
        link: form.link.trim(),
        message: form.message.trim(),
      });
      onSent(email);
    } catch (error) {
      setSendError(
        error instanceof ApiError ? error.message : 'We couldn’t send your application. Try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title={`Apply: ${role.title}`}
      description={roleMeta(role)}
      busy={isSending}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSending} loadingLabel="Sending…" onClick={send}>
            Send application
          </Button>
        </>
      }
    >
      <form
        className={styles.form}
        aria-label={`Apply: ${role.title}`}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <button type="button" className={styles.back} onClick={onBack}>
          <Icon name="chevronLeft" size={16} strokeWidth={1.8} />
          All roles
        </button>
        {sendError && (
          <Alert tone="danger" role="alert">
            {sendError}
          </Alert>
        )}
        <ContactFields form={form} errors={visible} onChange={update} />
        <TextField
          label="Portfolio or LinkedIn link"
          inputMode="url"
          autoComplete="url"
          placeholder="https://"
          value={form.link}
          error={visible.link}
          onChange={(event) => update({ link: event.target.value })}
        />
        <TextAreaField
          label="Why this role?"
          rows={4}
          placeholder="A few lines are plenty"
          value={form.message}
          onChange={(event) => update({ message: event.target.value })}
        />
      </form>
    </Dialog>
  );
}
