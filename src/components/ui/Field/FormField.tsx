import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

import styles from './Field.module.css';

/** Accessibility wiring handed to the control rendered inside a `FormField`. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export interface FormFieldOptions {
  label: ReactNode;
  /** Marks the field as required: a Garnet asterisk after the label plus `aria-required` on the control. */
  required?: boolean;
  /** Short note on the right of the label row, e.g. "Read only" or "52/300". */
  hint?: ReactNode;
  helpText?: ReactNode;
  /** Replaces the help text and marks the control invalid. */
  error?: ReactNode;
  successText?: ReactNode;
  /** Keeps the label for screen readers only. */
  labelHidden?: boolean;
  className?: string;
  /** Provide your own id, e.g. to point a `<label htmlFor>` elsewhere at the control. */
  id?: string;
}

interface FormFieldProps extends FormFieldOptions {
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, control and one line of help or error. Wires `htmlFor`, `aria-describedby`,
 * `aria-invalid` and `aria-required` so every field in both apps behaves the same.
 */
export function FormField({
  label,
  required,
  hint,
  helpText,
  error,
  successText,
  labelHidden,
  className,
  id,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const message = error ?? successText ?? helpText;

  return (
    <div className={clsx(styles.field, className)}>
      <div className={clsx(styles.labelRow, labelHidden && 'visually-hidden')}>
        <label htmlFor={controlId} className={styles.label}>
          {label}
          {required && (
            <span aria-hidden="true" className={styles.asterisk}>
              *
            </span>
          )}
        </label>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>

      {children({
        id: controlId,
        'aria-describedby': message ? messageId : undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}

      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={clsx(styles.message, error ? styles.error : successText ? styles.success : styles.help)}
        >
          {message}
        </p>
      )}
    </div>
  );
}
