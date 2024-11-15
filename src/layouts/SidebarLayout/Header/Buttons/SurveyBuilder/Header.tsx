// Header.tsx
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface HeaderProps {
  title: string;
  onClose: () => void;
}

function Header({ title, onClose }: HeaderProps) {
  return (
    <Box
      p={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bgcolor="background.paper"
      boxShadow={2}
      borderRadius="8px 8px 0 0" // Rounded corners for top
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1,
      }}
    >
      <Typography variant="h5" fontWeight="600">
        {title}
      </Typography>
      <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

export default Header;
