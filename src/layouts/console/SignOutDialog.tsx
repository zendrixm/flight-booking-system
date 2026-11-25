import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { useStaffSession } from '@/app/providers';
import { Button, Dialog } from '@/components/ui';

import styles from './SignOutDialog.module.css';

interface SignOutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SignOutDialog({ open, onClose }: SignOutDialogProps) {
  const navigate = useNavigate();
  const { staff, session, signOut } = useStaffSession();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      size="small"
      icon="logOut"
      iconTone="danger"
      title="Sign out of Vela Console?"
      description="You’ll need company SSO, or your password and a 2-step verification code, to sign back in. Anything you haven’t saved on this page will be lost."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Stay signed in
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              // Leave the console first so the layout doesn't treat this as an expired session.
              navigate(paths.console.login, { replace: true });
              signOut();
            }}
          >
            Sign out
          </Button>
        </>
      }
    >
      <p className={styles.session}>
        <span className={styles.dot} aria-hidden="true" />
        Signed in as {staff?.email} since {session.signedInAt} · {session.location}
      </p>
    </Dialog>
  );
}
