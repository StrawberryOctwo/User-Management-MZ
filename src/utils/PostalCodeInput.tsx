import React, { useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PostalCodeInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PostalCodeInput: React.FC<PostalCodeInputProps> = ({
  value,
  onChange,
  ...props
}) => {
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Validate for 5-digit numbers
    const isValidPostalCode = /^\d{0,5}$/.test(inputValue);

    if (isValidPostalCode) {
      setError(null);
      onChange(inputValue);
    } else {
      setError('Postal code must be a 5-digit number');
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      inputProps={{ maxLength: 5 }} // Limit input to 5 characters
      variant="outlined"
      label={t('postal_code')}
    />
  );
};

export default PostalCodeInput;
