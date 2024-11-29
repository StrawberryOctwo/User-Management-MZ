import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import ScheduleTwoToneIcon from '@mui/icons-material/ScheduleTwoTone';
import { formatDistance } from 'date-fns';
import {
  DividerWrapper,
  CardWrapperPrimary,
  CardWrapperSecondary
} from './styles';
import {
  fetchMessages,
  formatDateDivider
} from '../../utils/chat';
import AvatarWithInitials from '../../utils/Avatar';
import { useAuth } from 'src/hooks/useAuth';

function ChatContent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    fetchMessages(setMessages, setLoading);
  }, []);

  return (
    <Box p={3}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : messages.length === 0 ? (
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
        <>
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

            const isSender = message.sender.id === userId;

            acc.push(
              <Box
                key={message.id}
                display="flex"
                alignItems="flex-start"
                justifyContent={isSender ? 'flex-end' : 'flex-start'}
                py={3}
              >
                {!isSender && (
                  <AvatarWithInitials
                    firstName={message.sender.firstName}
                    lastName={message.sender.lastName}
                  />
                )}
                <Box
                  display="flex"
                  alignItems={isSender ? 'flex-end' : 'flex-start'}
                  flexDirection="column"
                  justifyContent={isSender ? 'flex-end' : 'flex-start'}
                  ml={isSender ? 0 : 2}
                  mr={isSender ? 2 : 0}
                >
                  <Box
                    component={
                      isSender ? CardWrapperPrimary : CardWrapperSecondary
                    }
                  >
                    {message.content}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      pt: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ScheduleTwoToneIcon
                      sx={{
                        mr: 0.5
                      }}
                      fontSize="small"
                    />
                    {formatDistance(new Date(message.sentAt), new Date(), {
                      addSuffix: true
                    })}
                  </Typography>
                </Box>
                {isSender && (
                  <AvatarWithInitials firstName="Ahmad" lastName="Jaffal" />
                )}
              </Box>
            );

            return acc;
          }, [])}
        </>
      )}
    </Box>
  );
}

export default ChatContent;
