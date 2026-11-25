import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import { Spinner } from '../Spinner';
import styles from './Field.module.css';
import { FormField, type FormFieldOptions } from './FormField';

export interface TextFieldProps
  extends FormFieldOptions, Omit<ComponentProps<'input'>, 'prefix' | 'className' | 'id'> {
  /** Decorative icon inside the box on the left, e.g. `search` or `calendar`. */
  leadingIcon?: IconName;
  /** Short fixed text inside the box, e.g. "₱" or "+63". */
  prefix?: string;
  /** Controls inside the box on the right, e.g. a clear or show-password button. */
  trailing?: ReactNode;
  /** Shows a spinner where the trailing action sits and marks the field busy. */
  loading?: boolean;
  inputClassName?: string;
}

export function TextField({
  label,
  required,
  hint,
  helpText,
  error,
  successText,
  labelHidden,
  className,
  id,
  leadingIcon,
  prefix,
  trailing,
  loading,
  inputClassName,
  type = 'text',
  ...inputProps
}: TextFieldProps) {
  const showSuccess = Boolean(successText) && !error;
  const trailingContent = loading ? (
    <Spinner size={16} />
  ) : showSuccess && !trailing ? (
    <SuccessMark />
  ) : (
    trailing
  );

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      helpText={helpText}
      error={error}
      successText={successText}
      labelHidden={labelHidden}
      className={className}
      id={id}
    >
      {(control) => (
        <div className={styles.controlWrap}>
          {leadingIcon && <Icon name={leadingIcon} className={styles.leading} size={18} />}
          {prefix && (
            <span className={styles.prefix} aria-hidden="true">
              {prefix}
            </span>
          )}
          <input
            type={type}
            {...control}
            aria-busy={loading || undefined}
            className={clsx(
              styles.control,
              leadingIcon && styles.hasLeading,
              prefix && styles.hasPrefix,
              trailingContent && styles.hasTrailing,
              showSuccess && styles.controlSuccess,
              inputClassName,
            )}
            {...inputProps}
          />
          {trailingContent && <div className={styles.trailing}>{trailingContent}</div>}
        </div>
      )}
    </FormField>
  );
}

function SuccessMark() {
  return <Icon name="check" size={16} strokeWidth={2} className={styles.successIcon} />;
}
