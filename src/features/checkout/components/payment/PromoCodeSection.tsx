import { useState, type FormEvent } from 'react';

import { Icon } from '@/components/icons';
import { Button, TextField } from '@/components/ui';

import { findPromoCode, type PromoCode } from '../../lib/promoCodes';
import styles from './PromoCodeSection.module.css';

interface PromoCodeSectionProps {
  applied: PromoCode | undefined;
  onApply: (code: string) => void;
  onRemove: () => void;
}

export function PromoCodeSection({ applied, onApply, onRemove }: PromoCodeSectionProps) {
  const [code, setCode] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleApply = (event: FormEvent) => {
    event.preventDefault();
    const promo = findPromoCode(code);
    if (!promo) {
      setHasError(true);
      return;
    }
    onApply(promo.code);
    setCode('');
  };

  return (
    <section className={styles.section} aria-labelledby="promo-title">
      <h2 id="promo-title" className={styles.title}>
        Promo code
      </h2>
      {applied ? (
        <div className={styles.applied}>
          <span className={styles.appliedText} role="status">
            <Icon name="checkCircle" size={18} strokeWidth={1.8} />
            {applied.code} applied — {applied.description}
          </span>
          <Button variant="ghost" size="small" className={styles.remove} onClick={onRemove}>
            Remove <span className="visually-hidden">promo code {applied.code}</span>
          </Button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleApply} noValidate>
          <TextField
            className={styles.field}
            label="Promo code"
            labelHidden
            placeholder="Enter code"
            inputClassName={styles.input}
            value={code}
            error={
              hasError ? 'This code has expired or isn’t valid for this route. Try VELA1000.' : undefined
            }
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              setHasError(false);
            }}
          />
          <Button type="submit" variant="secondary" size="large" disabled={!code.trim()}>
            Apply
          </Button>
        </form>
      )}
    </section>
  );
}
