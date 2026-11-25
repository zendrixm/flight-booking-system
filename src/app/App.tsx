// The DOM build of RouterProvider supports `flushSync` on navigations (used by useUrlQuery).
import { RouterProvider } from 'react-router/dom';

import { AppProviders } from './providers';
import { router } from './router';

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
