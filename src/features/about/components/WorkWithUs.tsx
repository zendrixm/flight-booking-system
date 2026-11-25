import { Button } from '@/components/ui';
import { pluralize } from '@/lib/format';

import styles from './WorkWithUs.module.css';

export type AboutDialog = 'careers' | 'partner' | 'press';

interface WorkWithUsProps {
  openRoleCount: number | undefined;
  onOpen: (dialog: AboutDialog) => void;
}

export function WorkWithUs({ openRoleCount, onOpen }: WorkWithUsProps) {
  const cards: Array<{ dialog: AboutDialog; title: string; body: string; action: string }> = [
    {
      dialog: 'careers',
      title: 'Careers',
      body: `We hire people who care about the small details of a trip.${
        openRoleCount ? ` ${pluralize(openRoleCount, 'open role')} right now.` : ''
      }`,
      action: 'See open roles',
    },
    {
      dialog: 'partner',
      title: 'Partnerships',
      body: 'Airlines, hotels and companies that book travel for their teams — let’s talk.',
      action: 'Partner with us',
    },
    {
      dialog: 'press',
      title: 'Press',
      body: 'Logos, screenshots and facts about Vela, ready for your story.',
      action: 'Get the press kit',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.dialog} className={styles.card}>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.body}>{card.body}</p>
          <Button
            variant="secondary"
            className={styles.action}
            aria-haspopup="dialog"
            onClick={() => onOpen(card.dialog)}
          >
            {card.action}
          </Button>
        </div>
      ))}
    </div>
  );
}
