import { paths } from '@/app/paths';
import { Breadcrumbs, Button, LinkButton } from '@/components/ui';

import styles from './AboutHero.module.css';

const BREADCRUMBS = [{ label: 'Home', to: paths.home }, { label: 'About us' }];

interface AboutHeroProps {
  onSeeOpenRoles: () => void;
}

export function AboutHero({ onSeeOpenRoles }: AboutHeroProps) {
  return (
    <section aria-labelledby="about-heading" className={styles.hero}>
      <div className={styles.intro}>
        <Breadcrumbs items={BREADCRUMBS} className={styles.breadcrumbs} />
        <span className={styles.eyebrow}>
          <span className={styles.rule} aria-hidden="true" />
          About Vela
        </span>
        <h1 id="about-heading" className={styles.title}>
          The first price <em>is the price.</em>
        </h1>
        <p className={styles.lead}>
          Vela started in Makati in 2019 because booking a flight home shouldn’t end with a total twice the
          one you clicked. Today we compare more than 120 airlines and show every fare with taxes and fees
          already in.
        </p>
        <div className={styles.actions}>
          <LinkButton to={paths.destinations} variant="primary" size="large">
            Explore destinations
          </LinkButton>
          <Button variant="quiet" size="large" aria-haspopup="dialog" onClick={onSeeOpenRoles}>
            See open roles
          </Button>
        </div>
      </div>
      <OrbitArt />
    </section>
  );
}

/** Routes circling Manila. Decorative. */
function OrbitArt() {
  return (
    <figure className={styles.art} aria-hidden="true">
      <svg viewBox="0 0 480 480" className={styles.svg}>
        <defs>
          <radialGradient id="about-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--color-brass)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--color-brass)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="240" cy="240" r="236" fill="url(#about-glow)" />
        <g className={styles.orbits}>
          <circle cx="240" cy="240" r="200" />
          <circle cx="240" cy="240" r="150" />
          <circle cx="240" cy="240" r="100" />
          <ellipse cx="240" cy="240" rx="200" ry="70" transform="rotate(-24 240 240)" />
          <ellipse cx="240" cy="240" rx="200" ry="70" transform="rotate(36 240 240)" />
        </g>
        <g className={styles.routes}>
          <path d="M240 240 C 300 160, 360 130, 410 120" />
          <path d="M240 240 C 180 300, 130 340, 90 380" />
          <path d="M240 240 C 300 290, 340 340, 360 400" />
        </g>
        <g className={styles.cities}>
          <circle cx="410" cy="120" r="6" />
          <circle cx="90" cy="380" r="6" />
          <circle cx="360" cy="400" r="6" />
        </g>
        <g className={styles.faintCities}>
          <circle cx="96" cy="150" r="4" />
          <circle cx="400" cy="300" r="4" />
        </g>
        <path className={styles.star} d="M240 168l14 58 58 14-58 14-14 58-14-58-58-14 58-14z" />
        <circle className={styles.home} cx="240" cy="240" r="8" />
      </svg>
    </figure>
  );
}
