import clsx from 'clsx';
import type { ElementType, ReactNode } from 'react';

import styles from './PageContainer.module.css';

interface PageContainerProps {
  /** Render as `main` for the page's main region, `section` or `div` otherwise. */
  as?: ElementType;
  /** `stack` puts the single page gap between children; `plain` leaves layout to the caller. */
  layout?: 'stack' | 'plain';
  className?: string;
  children: ReactNode;
  id?: string;
  'aria-labelledby'?: string;
}

/** Centres page content at the shared max width with the single page gap on every side. */
export function PageContainer({
  as: Element = 'div',
  layout = 'stack',
  className,
  children,
  ...rest
}: PageContainerProps) {
  return (
    <Element className={clsx(styles.container, layout === 'stack' && styles.stack, className)} {...rest}>
      {children}
    </Element>
  );
}
