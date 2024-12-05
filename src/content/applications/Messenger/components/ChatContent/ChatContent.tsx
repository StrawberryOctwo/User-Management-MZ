import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import ScheduleTwoToneIcon from '@mui/icons-material/ScheduleTwoTone';
import { format } from 'date-fns'; // Import the format function
import { fetchMessages, formatDateDivider } from '../../utils/chat';
import AvatarWithInitials from '../../utils/Avatar';
import { useAuth } from 'src/hooks/useAuth';
import { useChat } from '../../context/ChatContext';
import { useWebSocket } from 'src/utils/webSocketProvider';
import {
  DividerWrapper,
  CardWrapperPrimary,
  CardWrapperSecondary
} from './styles';

interface ChatContentProps {
  scrollbarRef: React.RefObject<any>;
}

function ChatContent({ scrollbarRef }: ChatContentProps) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();
  const { chatRoomId } = useChat();
  const socket = useWebSocket();

  const scrollToBottom = () => {
    if (scrollbarRef.current) {
      scrollbarRef.current.scrollToBottom();
    }
  };

  useEffect(() => {
    if (!chatRoomId) return;

    setLoading(true);
    fetchMessages(
      chatRoomId,
      (fetchedMessages) => {
        setMessages(fetchedMessages);

        setTimeout(() => {
          scrollToBottom();
        }, 100);
      },
      setLoading
    );

    socket.emit('join_room', `chat_${chatRoomId}`);

    socket.on('new_message', (message) => {
      if (message.chatRoom.id === chatRoomId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [chatRoomId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <Box p={2}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : !Array.isArray(messages) || messages.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          mt={5}
        >
          <Typography variant="h6" color="textSecondary">
            No messages yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Start a conversation to see your messages here.
          </Typography>
        </Box>
      ) : (
        <div>
          {messages.reduce((acc, message, index) => {
            const dateDivider = formatDateDivider(message.sentAt);

            if (
              index === 0 ||
              formatDateDivider(messages[index - 1].sentAt) !== dateDivider
            ) {
              acc.push(
                <DividerWrapper key={`divider-${dateDivider}`}>
                  {dateDivider}
                </DividerWrapper>
              );
            }

            const isSender = message.sender?.id === userId;

            acc.push(
              <Box
                key={message.id}
                display="flex"
                alignItems="flex-start"
                justifyContent={isSender ? 'flex-end' : 'flex-start'}
                py={1.5} // Reduced padding
              >
                {!isSender && (
                  <AvatarWithInitials
                    firstName={message.sender?.firstName}
                    lastName={message.sender?.lastName}
                    sx={{ width: 32, height: 32 }} // Smaller avatar
                  />
                )}
                <Box
                  display="flex"
                  alignItems={isSender ? 'flex-end' : 'flex-start'}
                  flexDirection="column"
                  justifyContent={isSender ? 'flex-end' : 'flex-start'}
                  ml={isSender ? 0 : 1.5} // Adjusted margin
                  mr={isSender ? 1.5 : 0}
                >
                  <Box
                    component={isSender ? CardWrapperPrimary : CardWrapperSecondary}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      maxWidth: '70%', // Constrain the width
                      fontSize: '0.875rem',
                      backgroundColor: (theme) =>
                        isSender
                          ? theme.palette.primary.dark // Darker primary for sender
                          : theme.palette.background.paper,
                      color: (theme) =>
                        isSender
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                    }}
                  >
                    {message.content}
                  </Box>
                  <Typography
                    variant="caption" // Smaller timestamp
                    sx={{
                      pt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: (theme) => theme.palette.text.secondary,
                    }}
                  >
                    <ScheduleTwoToneIcon
                      sx={{
                        mr: 0.5,
                        fontSize: '1rem', // Smaller icon
                      }}
                    />
                    {/* Display formatted time */}
                    {format(new Date(message.sentAt), 'hh:mm a')}
                  </Typography>
                </Box>
                {isSender && (
                  <AvatarWithInitials
                    firstName={message.sender?.firstName}
                    lastName={message.sender?.lastName}
                    sx={{ width: 32, height: 32 }} // Smaller avatar
                  />
                )}
              </Box>
            );

            return acc;
          }, [])}
        </div>
      )}
    </Box>
  );
}

export default ChatContent;
