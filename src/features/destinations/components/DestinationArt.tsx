import { useMemo } from 'react';

import { sceneFor } from '../lib/destinationScenes';
import styles from './DestinationArt.module.css';

interface DestinationArtProps {
  destinationCode: string;
}

/** The flat illustration at the top of a destination card. Decorative. */
export function DestinationArt({ destinationCode }: DestinationArtProps) {
  const scene = useMemo(() => sceneFor(destinationCode), [destinationCode]);

  return (
    <div className={styles.art} style={{ backgroundImage: scene.background }}>
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMax slice"
        className={styles.svg}
        aria-hidden="true"
      >
        {scene.layers.map((layer, index) => (
          <path
            key={index}
            d={layer.d}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth || undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
