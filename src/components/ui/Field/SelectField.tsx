import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from '@/components/icons';

import styles from './Field.module.css';
import { FormField, type FormFieldOptions } from './FormField';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends FormFieldOptions, Omit<ComponentProps<'select'>, 'className' | 'id'> {
  options: ReadonlyArray<SelectOption>;
  /** Adds a first, empty option such as "Choose a reason". */
  placeholder?: string;
  selectClassName?: string;
}

export function SelectField({
  label,
  required,
  hint,
  helpText,
  error,
  successText,
  labelHidden,
  className,
  id,
  options,
  placeholder,
  selectClassName,
  ...selectProps
}: SelectFieldProps) {
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
          <select
            {...control}
            className={clsx(styles.control, styles.select, selectClassName)}
            {...selectProps}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={16} strokeWidth={1.8} className={styles.chevron} />
        </div>
      )}
    </FormField>
  );
}
