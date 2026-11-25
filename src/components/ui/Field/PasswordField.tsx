import { useState } from 'react';

import { IconButton } from '../IconButton';
import { TextField, type TextFieldProps } from './TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>;

/** A password input with a show/hide toggle inside the box. */
export function PasswordField(props: PasswordFieldProps) {
  const [isShown, setIsShown] = useState(false);
  return (
    <TextField
      {...props}
      type={isShown ? 'text' : 'password'}
      trailing={
        <IconButton
          icon={isShown ? 'eyeOff' : 'eye'}
          label={isShown ? 'Hide password' : 'Show password'}
          size="small"
          onClick={() => setIsShown((shown) => !shown)}
        />
      }
    />
  );
}
