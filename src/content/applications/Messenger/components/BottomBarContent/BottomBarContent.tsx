import { Avatar, Box, Button, useTheme } from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import { user, MessageInputWrapper } from './styles';

function BottomBarContent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.colors.alpha.white[50],
        display: 'flex',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box flexGrow={1} display="flex" alignItems="center">
        <Avatar
          sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }}
          alt={user.name}
          src={user.avatar}
        />
        <MessageInputWrapper
          autoFocus
          placeholder="Write your message here..."
          fullWidth
        />
      </Box>
      <Box>
        <Button startIcon={<SendTwoToneIcon />} variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default BottomBarContent;
