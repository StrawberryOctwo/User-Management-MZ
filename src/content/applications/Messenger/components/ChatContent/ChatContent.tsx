import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import ScheduleTwoToneIcon from '@mui/icons-material/ScheduleTwoTone';
import { formatDistance } from 'date-fns';
import { fetchMessages, formatDateDivider, calculateMessagesPerPage, Message } from '../../utils/chat';
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
interface ChatContentProps {
  scrollbarRef: React.RefObject<any>;
}

// Debounce function
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

function ChatContent({ scrollbarRef }: ChatContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const { userId } = useAuth();
  const { chatRoomId } = useChat();
  const socket = useWebSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const messageHeight = 80;

  const scrollToBottom = () => {
    if (scrollbarRef.current) {
      scrollbarRef.current.scrollToBottom();
    }
  };

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce((chatId: number, pageNum: number, limit: number, append: boolean) => {
      fetchMessages({
        chatRoomId: chatId,
        page: pageNum,
        limit,
        setMessages,
        setLoading,
        setHasMore,
        setTotalMessages,
        append
      }).then(() => {
        if (!append) {
          setTimeout(scrollToBottom, 100);
        }
      });
    }, 300),
    []
  );

  // Debounced items per page update
  const debouncedSetItemsPerPage = useCallback(
    debounce((newValue: number) => {
      setItemsPerPage(newValue);
    }, 300),
    []
  );

  useLayoutEffect(() => {
    const updateItemsPerPage = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const calculatedItems = calculateMessagesPerPage(containerHeight, messageHeight);
        debouncedSetItemsPerPage(calculatedItems);
      }
    };

    resizeObserverRef.current = new ResizeObserver(updateItemsPerPage);

    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
      updateItemsPerPage();
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [messageHeight, debouncedSetItemsPerPage]);

  useEffect(() => {
    if (!chatRoomId || itemsPerPage === 0) return;

    setPage(1);
    setLoading(true);
    debouncedFetch(chatRoomId, 1, itemsPerPage, false);

    socket.emit('join_room', `chat_${chatRoomId}`);

    const handleNewMessage = (message) => {
      if (message.chatRoom.id === chatRoomId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        setTotalMessages(prev => prev + 1);
        setTimeout(scrollToBottom, 100);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [chatRoomId, itemsPerPage, debouncedFetch]);

  const loadMore = () => {
    if (!loading && hasMore) {
      debouncedFetch(chatRoomId, page + 1, itemsPerPage, true);
      setPage(prev => prev + 1);
    }
  };

  return (
    <Box p={2} ref={containerRef} sx={{ height: 'calc(100vh - 200px)' }}>
      {loading && page === 1 ? (
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
          {hasMore && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
          {messages.reduce((acc: JSX.Element[], message, index) => {
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
                py={1.5}
              >
                {!isSender && (
                  <AvatarWithInitials
                    firstName={message.sender?.firstName}
                    lastName={message.sender?.lastName}
                    sx={{ width: 32, height: 32 }}
                  />
                )}
                <Box
                  display="flex"
                  alignItems={isSender ? 'flex-end' : 'flex-start'}
                  flexDirection="column"
                  ml={isSender ? 0 : 1.5}
                  mr={isSender ? 1.5 : 0}
                >
                  <Box
                    component={isSender ? CardWrapperPrimary : CardWrapperSecondary}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      maxWidth: '70%',
                      fontSize: '0.875rem',
                      backgroundColor: (theme) =>
                        isSender
                          ? theme.palette.primary.dark
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
                    variant="caption"
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
                        fontSize: '1rem',
                      }}
                    />
                    {formatDistance(new Date(message.sentAt), new Date(), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Box>
                {isSender && (
                  <AvatarWithInitials
                    firstName={message.sender?.firstName}
                    lastName={message.sender?.lastName}
                    sx={{ width: 32, height: 32 }}
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