import { Icon, type IconName } from '@/components/icons';

import styles from './ValueProps.module.css';

interface ValueProp {
  icon: IconName;
  title: string;
  body: string;
}

const VALUE_PROPS: readonly ValueProp[] = [
  {
    icon: 'tag',
    title: 'All-in pricing',
    body: 'Taxes, carrier fees and a personal item are included in every fare we show. The price on the results page is the price you pay.',
  },
  {
    icon: 'rotateCcw',
    title: 'Changes without the maze',
    body: 'Fare rules in plain language before you book. Change or cancel online, and see your refund amount before you confirm.',
  },
  {
    icon: 'helpCircle',
    title: 'People on call, 24/7',
    body: 'Reach a travel specialist by chat or phone at any hour, in English or Filipino.',
  },
];

export function ValueProps() {
  return (
    <section className={styles.grid} aria-label="Why Vela">
      {VALUE_PROPS.map(({ icon, title, body }) => (
        <div key={title} className={styles.item}>
          <span className={styles.icon}>
            <Icon name={icon} size={22} />
          </span>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.body}>{body}</p>
        </div>
      ))}
    </section>
  );
}
