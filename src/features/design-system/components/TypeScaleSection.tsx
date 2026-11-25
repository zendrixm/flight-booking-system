import { TYPE_SCALE } from '../data/foundations';
import { DsSection } from './DsSection';
import styles from './TypeScaleSection.module.css';

export function TypeScaleSection() {
  return (
    <DsSection
      eyebrow="02 · Typography"
      title="Type scale"
      aside="Instrument Serif for moments that should feel considered — headlines, city names, prices on a pass. Instrument Sans for everything you read or operate. Numbers use tabular figures. Nothing smaller than 12px."
    >
      <dl className={styles.scale}>
        {TYPE_SCALE.map((type) => (
          <div key={type.style} className={styles.row}>
            <dt className={styles.meta}>
              <span className={styles.name}>{type.name}</span>
              <span className={styles.spec}>{type.spec}</span>
            </dt>
            <dd className={styles[type.style]}>{type.sample}</dd>
          </div>
        ))}
      </dl>
    </DsSection>
  );
}
