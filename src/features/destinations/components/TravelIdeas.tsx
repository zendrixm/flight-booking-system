import { Link } from 'react-router';

import { Icon } from '@/components/icons';
import { formatPeso } from '@/lib/format';
import type { TravelIdea } from '@/types/destination';

import styles from './TravelIdeas.module.css';

interface TravelIdeasProps {
  ideas: readonly TravelIdea[];
  resultsUrlFor: (destinationCode: string) => string;
}

/** The dark band of holiday-weekend suggestions under the destination grid. */
export function TravelIdeas({ ideas, resultsUrlFor }: TravelIdeasProps) {
  return (
    <section aria-labelledby="travel-ideas-heading" className={styles.band}>
      <svg viewBox="0 0 520 520" className={styles.rings} aria-hidden="true">
        {[250, 190, 130, 70].map((radius) => (
          <circle key={radius} cx={260} cy={260} r={radius} />
        ))}
      </svg>

      <div className={styles.intro}>
        <span className={styles.eyebrow}>Travel ideas</span>
        <h2 id="travel-ideas-heading" className={styles.title}>
          Make the most of <em>the long weekends.</em>
        </h2>
        <p className={styles.lead}>
          Holiday weekends before the year is out, and the short hops that fit them best.
        </p>
      </div>

      <ol className={styles.list}>
        {ideas.map((idea, index) => (
          <li key={idea.title} className={styles.item}>
            <Link to={resultsUrlFor(idea.destinationCode)} className={styles.idea}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.text}>
                <span className={styles.ideaTitle}>{idea.title}</span>
                <span className={styles.detail}>{idea.detail}</span>
                <span className={styles.inlinePrice}>from {formatPeso(idea.fromFare)}</span>
              </span>
              <span className={styles.price} aria-hidden="true">
                <span className={styles.priceFrom}>from</span>
                <span className={styles.priceAmount}>{formatPeso(idea.fromFare)}</span>
              </span>
              <Icon name="arrowRight" size={18} strokeWidth={1.8} className={styles.arrow} />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
