import { useEffect } from 'react';

const APP_NAME = 'Vela';

/** Sets `document.title` as "Page · Vela" for the lifetime of the page. */
export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);
}
