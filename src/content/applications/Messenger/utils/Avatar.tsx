import React from 'react';
import { Avatar } from '@mui/material';
import { t } from "i18next"

interface AvatarWithInitialsProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string; // Optional: if the user has a custom avatar image
  size?: number; // Optional: allow customization of size
  sx?: object;
}

const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
  firstName = 'Jhon',
  lastName = 'Doe',
  avatarUrl,
  size = 40,

}) => {
  const isValidName = (name: string) => {
    return /^[a-zA-Z]+$/.test(name);
  };

  const getInitials = () => {
    if (isValidName(firstName) && isValidName(lastName)) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'Unknown'; // Default initials if names are invalid
  };

  return (
    <Avatar
      variant="rounded"
      sx={{
        bgcolor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.primary.contrastText,
      }}
    >
      {getInitials()}
    </Avatar>
  );
};

export default AvatarWithInitials;
