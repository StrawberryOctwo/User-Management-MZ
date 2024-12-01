import { Box, Button, useTheme } from '@mui/material';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import { MessageInputWrapper } from './styles';
import { sendMessage } from 'src/services/chatService';
import { useState, useRef } from 'react';
import AvatarWithInitials from '../../utils/Avatar';
import { useChat } from '../../context/ChatContext';

function BottomBarContent() {
  const theme = useTheme();
  const { chatRoomId, firstName, lastName } = useChat();
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (content: string) => {
    try {
      if (!content) return;
      await sendMessage(chatRoomId, content);
      setMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage(message);
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
      <Box flexGrow={1} display="flex" alignItems="center" gap={1}>
        <AvatarWithInitials firstName={firstName} lastName={lastName} />
        <MessageInputWrapper
          autoFocus
          placeholder="Write your message here..."
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          inputRef={inputRef}
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
