import { useEffect, type RefObject } from 'react';

/** Calls `onOutside` when a pointer press lands outside every element in `refs`. */
export function useOnClickOutside(
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  onOutside: () => void,
  active = true,
) {
  useEffect(() => {
    if (!active) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutside();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [refs, onOutside, active]);
}
