import { Navigate, Outlet, useLocation } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';

/** Sends signed-out visitors to sign in, then back to the page they asked for. */
export function RequireAuth() {
  const { isSignedIn } = useSession();
  const location = useLocation();

  if (!isSignedIn) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`${paths.signIn}?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  return <Outlet />;
}
