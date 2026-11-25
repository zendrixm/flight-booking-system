import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Layers that close on Escape, newest last. Only the top layer handles a press, so Escape in a
 * confirmation opened from a drawer closes the confirmation and leaves the drawer open.
 */
const layers: Array<{ current: () => void }> = [];

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  layers.at(-1)?.current();
}

/** Calls `onEscape` when Escape is pressed while `active` is true and no newer layer is open. */
export function useEscapeKey(onEscape: () => void, active = true) {
  const handlerRef = useRef(onEscape);
  useLayoutEffect(() => {
    handlerRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return undefined;
    const layer = handlerRef;
    layers.push(layer);
    if (layers.length === 1) document.addEventListener('keydown', handleKeyDown);
    return () => {
      layers.splice(layers.indexOf(layer), 1);
      if (layers.length === 0) document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
}
