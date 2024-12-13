import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface IbanInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const IbanInput: React.FC<IbanInputProps> = ({ value, onChange, ...props }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value.startsWith('DE -')) {
      // If the value doesn't start with "DE -", set the initial prefix
      onChange(formatIban(value));
    }
  }, [value, onChange]);

  const formatIban = (inputValue: string) => {
    // Remove all non-digit characters except for the initial "DE - "
    const cleanedValue = inputValue.replace(/[^0-9]/g, '');
    // Group the digits in sets of 4
    const formattedValue = cleanedValue.match(/.{1,4}/g)?.join(' ') || '';
    return `DE${formattedValue}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const ibanRegex = /^DE - (\d{1,4} ?){0,5}\d{0,4}$/;

    if (ibanRegex.test(inputValue)) {
      setError(null);
      onChange(formatIban(inputValue));
    } else {
      setError('IBAN must start with "DE - " followed by up to 22 digits');
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      inputProps={{ maxLength: 29 }} // "DE - " + 22 digits + 5 spaces
      variant="outlined"
    />
  );
};

export default IbanInput;
