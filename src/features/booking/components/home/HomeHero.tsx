import { HeroGlobeArt } from './HeroGlobeArt';
import styles from './HomeHero.module.css';

/** Midnight hero that continues the app bar; the search card overlaps its lower edge. */
export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <HeroGlobeArt className={styles.art} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.rule} aria-hidden="true" />
          Flights, without the fine print
        </p>
        <h1 id="home-title" className={styles.title}>
          Every fare, <em className={styles.accent}>in full view.</em>
        </h1>
        <p className={styles.lede}>
          Compare flights across 120+ airlines. The price you see already includes taxes, carrier fees and a
          personal item — nothing is added at checkout.
        </p>
      </div>
    </section>
  );
}
