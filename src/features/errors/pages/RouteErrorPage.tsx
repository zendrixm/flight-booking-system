import { isRouteErrorResponse, useRouteError } from 'react-router';

import { paths } from '@/app/paths';
import { PageContainer } from '@/components/layout';
import { Button, EmptyState, LinkButton } from '@/components/ui';

import { NotFoundPage } from './NotFoundPage';

/** Shown when a route throws while loading or rendering. 404 responses get the not-found page. */
export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  if (import.meta.env.DEV) console.error(error);

  return (
    <PageContainer as="main">
      <EmptyState
        icon="alertTriangle"
        title="Something went wrong"
        description="This page couldn’t load. Try again, and if it keeps happening, our team is available 24/7."
        actions={
          <>
            <Button variant="primary" iconStart="refresh" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <LinkButton to={paths.home} variant="quiet">
              Go to home
            </LinkButton>
          </>
        }
      />
    </PageContainer>
  );
}
