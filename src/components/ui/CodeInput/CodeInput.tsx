import clsx from 'clsx';
import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

import styles from './CodeInput.module.css';

export const CODE_LENGTH = 6;

interface CodeInputProps {
  /** Digits typed so far, up to six. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  isInvalid?: boolean;
  describedBy?: string;
}

/**
 * Six one-digit boxes for a one-time code. Typing moves forward, Backspace moves back and pasting
 * a full code fills every box.
 */
export function CodeInput({ value, onChange, label, isInvalid, describedBy }: CodeInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? '');

  const focusBox = (index: number) => inputs.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();

  const setFrom = (index: number, typed: string) => {
    const incoming = typed.replace(/\D/g, '');
    if (!incoming) return;
    const next = (digits.slice(0, index).join('') + incoming).slice(0, CODE_LENGTH);
    onChange(next);
    focusBox(next.length);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      onChange(digits.slice(0, index - 1).join(''));
      focusBox(index - 1);
    } else if (event.key === 'Backspace') {
      onChange(digits.slice(0, index).join(''));
    } else if (event.key === 'ArrowLeft') {
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      focusBox(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFrom(index, event.clipboardData.getData('text'));
  };

  return (
    <div role="group" aria-label={label} aria-describedby={describedBy} className={styles.group}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={isInvalid || undefined}
          className={clsx(styles.box, digit && styles.filled, isInvalid && styles.invalid)}
          onChange={(event) => setFrom(index, event.target.value.slice(-CODE_LENGTH))}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
