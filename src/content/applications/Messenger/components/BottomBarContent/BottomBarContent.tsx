import { Box, Button, useTheme } from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import { user, MessageInputWrapper } from './styles';
import { useAuth } from 'src/hooks/useAuth';
import { sendMessage } from 'src/services/chatService';
import { useState } from 'react';
import AvatarWithInitials from '../../utils/Avatar';

function BottomBarContent() {
  const theme = useTheme();
  const { userId } = useAuth();
  const [message, setMessage] = useState('');

  const handleSendMessage = async (content: string) => {
    try {
      if (!content) return;
      const response = await sendMessage(userId, content);
      console.log('Message sent:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
        <AvatarWithInitials firstName="John" lastName="Doe" />
        <MessageInputWrapper
          autoFocus
          placeholder="Write your message here..."
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Box>
      <Box>
        <Button
          startIcon={<SendTwoToneIcon />}
          variant="contained"
          onClick={() => handleSendMessage(message)}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default BottomBarContent;
