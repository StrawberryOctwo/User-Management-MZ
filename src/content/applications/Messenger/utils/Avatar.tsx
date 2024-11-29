import React from 'react';
import { Avatar } from '@mui/material';

interface AvatarWithInitialsProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string; // Optional: if the user has a custom avatar image
  size?: number; // Optional: allow customization of size
}

const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
  firstName = 'Jhon',
  lastName = 'Doe',
  avatarUrl,
  size = 40
}) => {
  const isValidName = (name: string) => {
    return /^[a-zA-Z]+$/.test(name);
  };

  const getInitials = () => {
    if (isValidName(firstName) && isValidName(lastName)) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return '??'; // Default initials if names are invalid
  };

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: avatarUrl ? 'transparent' : '#1976d2', // Default color if no avatar
        fontSize: size / 2, // Scale font size based on avatar size
        color: '#fff', // White text color for initials
        borderRadius: '8px' // Rounded corners
      }}
      alt={`${firstName} ${lastName}`}
      src={avatarUrl} // If `avatarUrl` is provided, it will load the image
    >
      {!avatarUrl && getInitials()} {/* Show initials if no avatar */}
    </Avatar>
  );
};

export default AvatarWithInitials;
