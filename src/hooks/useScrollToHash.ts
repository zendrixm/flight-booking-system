import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Frames to wait for a lazily loaded page to render the target. */
const MAX_ATTEMPTS = 30;

/**
 * Scrolls to the element named by the URL hash (e.g. `/#find-booking`) after client-side
 * navigation, which browsers only do on full page loads. Hashes without a matching element are ignored.
 */
export function useScrollToHash(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let frame = 0;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ block: 'start' });
      else if (attempts++ < MAX_ATTEMPTS) frame = requestAnimationFrame(tryScroll);
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
}
