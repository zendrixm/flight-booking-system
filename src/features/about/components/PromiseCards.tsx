import { Link } from 'react-router';

import { Icon } from '@/components/icons';

import { PROMISES } from '../content/aboutContent';
import styles from './PromiseCards.module.css';

export function PromiseCards() {
  return (
    <div className={styles.grid}>
      {PROMISES.map((promise) => (
        <article key={promise.title} className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <Icon name={promise.icon} size={22} />
          </span>
          <h3 className={styles.title}>{promise.title}</h3>
          <p className={styles.body}>{promise.body}</p>
          <Link to={promise.linkTo} className={styles.link}>
            {promise.linkLabel}
          </Link>
        </article>
      ))}
    </div>
  );
}
