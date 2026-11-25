import clsx from 'clsx';
import type { ComponentProps } from 'react';

import styles from './Field.module.css';
import { FormField, type FormFieldOptions } from './FormField';

export interface TextAreaFieldProps
  extends FormFieldOptions, Omit<ComponentProps<'textarea'>, 'className' | 'id'> {
  /** Shows "used/max" in the label row when `maxLength` is set. */
  showCount?: boolean;
  textareaClassName?: string;
}

export function TextAreaField({
  label,
  required,
  hint,
  helpText,
  error,
  successText,
  labelHidden,
  className,
  id,
  showCount,
  textareaClassName,
  rows = 4,
  ...textareaProps
}: TextAreaFieldProps) {
  const length = typeof textareaProps.value === 'string' ? textareaProps.value.length : 0;
  const counter = showCount && textareaProps.maxLength ? `${length}/${textareaProps.maxLength}` : undefined;

  return (
    <FormField
      label={label}
      required={required}
      hint={hint ?? counter}
      helpText={helpText}
      error={error}
      successText={successText}
      labelHidden={labelHidden}
      className={className}
      id={id}
    >
      {(control) => (
        <textarea
          rows={rows}
          {...control}
          className={clsx(styles.control, styles.textarea, textareaClassName)}
          {...textareaProps}
        />
      )}
    </FormField>
  );
}
