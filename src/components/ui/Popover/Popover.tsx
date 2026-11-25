import clsx from 'clsx';
import { useCallback, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';

import { useEscapeKey, useOnClickOutside } from '@/hooks';

import styles from './Popover.module.css';

export interface PopoverTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-haspopup': 'dialog' | 'menu' | 'listbox';
}

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Render the trigger and spread the provided props onto it. */
  trigger: (props: PopoverTriggerProps) => ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  /** Open below the trigger (default) or above it, e.g. for a menu at the bottom of a sidebar. */
  side?: 'bottom' | 'top';
  /** Width of the panel in pixels. */
  width?: number;
  role?: 'dialog' | 'menu' | 'listbox';
  /** Accessible name of the panel when it is a dialog. */
  label?: string;
  /** Stretch the anchor to its container (for full-width triggers). */
  block?: boolean;
  className?: string;
  panelClassName?: string;
}

/** Space kept between a panel and the edge of the viewport. */
const VIEWPORT_MARGIN = 16;

/**
 * Nudges an open panel sideways so it stays on screen, e.g. a start-aligned panel under a trigger
 * near the right edge of a phone. Uses the `translate` property so it doesn't fight the animation.
 */
function useKeepInViewport(panelRef: RefObject<HTMLElement | null>, open: boolean) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const place = () => {
      panel.style.translate = '';
      const { left, right } = panel.getBoundingClientRect();
      const maxRight = document.documentElement.clientWidth - VIEWPORT_MARGIN;
      const shift = right > maxRight ? maxRight - right : left < VIEWPORT_MARGIN ? VIEWPORT_MARGIN - left : 0;
      if (shift) panel.style.translate = `${Math.round(shift)}px 0`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [panelRef, open]);
}

/** A floating panel anchored under its trigger. Closes on Escape and on clicks outside. */
export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  width,
  role = 'dialog',
  label,
  block,
  className,
  panelClassName,
}: PopoverProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const closeAndRefocus = useCallback(() => {
    onOpenChange(false);
    triggerRef.current?.focus();
  }, [onOpenChange]);

  useOnClickOutside([anchorRef], close, open);
  useEscapeKey(closeAndRefocus, open);
  useKeepInViewport(panelRef, open);

  return (
    <div ref={anchorRef} className={clsx(styles.anchor, block && styles.block, className)}>
      {trigger({
        ref: triggerRef,
        onClick: () => onOpenChange(!open),
        'aria-expanded': open,
        'aria-controls': panelId,
        'aria-haspopup': role,
      })}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role={role === 'menu' ? undefined : role}
          aria-label={role === 'dialog' ? label : undefined}
          className={clsx(styles.panel, styles[align], side === 'top' && styles.top, panelClassName)}
          style={width ? { width } : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}
