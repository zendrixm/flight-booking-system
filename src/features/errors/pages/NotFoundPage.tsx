import { paths } from '@/app/paths';
import { PageContainer } from '@/components/layout';
import { EmptyState, LinkButton } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <PageContainer as="main">
      <EmptyState
        icon="searchX"
        headingLevel={2}
        title="We can’t find that page"
        description="The link may be out of date, or the page has moved. Search for flights or find a booking from the home page."
        actions={
          <>
            <LinkButton to={paths.home} variant="primary">
              Go to home
            </LinkButton>
            <LinkButton to={paths.help} variant="quiet">
              Get help
            </LinkButton>
          </>
        }
      />
    </PageContainer>
  );
}
