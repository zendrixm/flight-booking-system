import { TIMELINE } from '../content/aboutContent';
import styles from './StoryTimeline.module.css';

/** "Our story": the dark band with the company timeline. */
export function StoryTimeline() {
  return (
    <section aria-labelledby="story-heading" className={styles.band}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>Our story</span>
        <h2 id="story-heading" className={styles.title}>
          Seven years, <em>one rule.</em>
        </h2>
        <p className={styles.lead}>
          From a three-person team in a Makati co-working space to 180 people across Manila, Cebu and
          Singapore.
        </p>
      </div>
      <ol className={styles.timeline}>
        {TIMELINE.map((milestone) => (
          <li key={milestone.year} className={styles.milestone}>
            <span className={styles.year}>{milestone.year}</span>
            <span className={styles.text}>
              <span className={styles.milestoneTitle}>{milestone.title}</span>
              <span className={styles.milestoneBody}>{milestone.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
