import type { ComponentType } from 'react';

/**
 * Adapts a named page export to React Router's `lazy` route option so every page is its own chunk:
 * `lazy: lazyPage(() => import('@/features/booking/pages/HomePage'), 'HomePage')`.
 */
export function lazyPage<Module extends Record<Name, ComponentType>, Name extends keyof Module & string>(
  load: () => Promise<Module>,
  exportName: Name,
) {
  return async () => {
    const module = await load();
    return { Component: module[exportName] };
  };
}
