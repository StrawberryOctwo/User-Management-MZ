import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemText,
  Button,
  Tooltip,
} from "@mui/material";
import SearchTwoToneIcon from "@mui/icons-material/SearchTwoTone";
import AddIcon from "@mui/icons-material/Add";
import { RootWrapper, ListItemWrapper } from "./styles";
import AvatarWithInitials from "../../utils/Avatar";
import { useAuth } from "src/hooks/useAuth";
import { useChat } from "../../context/ChatContext";
import NewChatPopup from "./NewChatPopup";
import { useWebSocket } from "src/utils/webSocketProvider";
import { resetUnreadCount, getAllChats } from "src/services/chatService";
import { useTranslation } from 'react-i18next';

const calculateItemsPerPage = (containerHeight, itemHeight) => {
  return Math.floor(containerHeight / itemHeight);
};

const fetchChats = async (
  setChats,
  setLoading,
  searchTerm,
  page,
  limit,
  setHasMore,
  setTotalChats,
  append = false
) => {
  setLoading(true);
  try {
    const response = await getAllChats(searchTerm, page, limit);
    const data = response.chats;
    setTotalChats(response.totalChats);

    if (!data || data.length === 0) {
      if (!append) {
        setChats([]);
      }
      setHasMore(false);
    } else {
      setChats(prevChats => append ? [...prevChats, ...data] : data);
      setHasMore(response.totalChats > (page * limit));
    }
  } catch (err) {
    console.error('Error fetching chats:', err);
    if (!append) {
      setChats([]);
    }
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};

function SidebarContent() {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalChats, setTotalChats] = useState(0);
  const { userId } = useAuth();
  const { setChatRoomId, setParticipants } = useChat();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const socket = useWebSocket();
  const listRef = useRef(null);
  const chatItemHeight = 72;
  const { t } = useTranslation(); 
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (listRef.current) {
        const containerHeight = listRef.current.offsetHeight;
        const calculatedItems = calculateItemsPerPage(containerHeight, chatItemHeight);
        setItemsPerPage(Math.max(calculatedItems, 5));
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchChats(
        setChats,
        setLoading,
        searchTerm,
        page,
        itemsPerPage,
        setHasMore,
        setTotalChats,
        page > 1
      );
    }, 300);
    return () => clearTimeout(debounceFetch);
  }, [searchTerm, page, itemsPerPage]);

  useEffect(() => {
    socket.emit("join_room", `user_${userId}`);

    socket.on("chat_updated", (updatedChat) => {
      

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat.id === updatedChat.id
        );

        let updatedChats;

        if (chatIndex !== -1) {
          updatedChats = [...prevChats];
          updatedChats[chatIndex] = {
            ...prevChats[chatIndex],
            lastMessage: updatedChat.lastMessage,
          };
        } else {
          updatedChats = [...prevChats, updatedChat];
        }

        return updatedChats.sort((a, b) => {
          const dateA = new Date(a.lastMessage?.sentAt || 0).getTime();
          const dateB = new Date(b.lastMessage?.sentAt || 0).getTime();
          return dateB - dateA;
        });
      });
    });

    return () => {
      socket.off("chat_updated");
    };
  }, [userId, socket]);

  const handleChatClick = async (chat) => {
    setChatRoomId(chat.id);
    setParticipants(chat.participants || []);

    if (chat.lastMessage?.sender?.id !== userId && !chat.lastMessage?.isRead) {
      try {
        await resetUnreadCount(chat.id);
        
      } catch (error) {
        console.error("Failed to reset unread messages:", error);
      }
    }

    setChats((prevChats) =>
      prevChats.map((c) =>
        c.id === chat.id
          ? {
            ...c,
            lastMessage: {
              ...c.lastMessage,
              isRead: true,
            },
          }
          : c
      )
    );
  };

  const handleNewChatClick = () => {
    setIsPopupOpen(true);
  };

  const handleSelectUser = async (user, roomId) => {
    try {
      const participant = {
        id: user.id,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
      };

      const newChat = {
        id: roomId,
        participants: [participant],
        lastMessage: null,
        isGroup: false,
      };

      setChats(prevChats => [newChat, ...prevChats]);
      setChatRoomId(roomId);
      setParticipants([participant]);
      setIsPopupOpen(false);
    } catch (error) {
      console.error('Error handling user selection:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <RootWrapper>
      <Box
        sx={{
          display: "flex",
          alignContent: "center",
          mb: 2,
          mt: 1,
          gap: 2,
        }}
      >
        <TextField
          sx={{
            mb: 1,
          }}
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchTwoToneIcon />
              </InputAdornment>
            ),
          }}
          placeholder={t("search_bar")}
        />
        <Tooltip title="New Chat" arrow>
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: "auto",
              padding: "6px",
              width: "36px",
              height: "36px",
            }}
            onClick={handleNewChatClick}
          >
            <AddIcon />
          </Button>
        </Tooltip>
      </Box>

      <Box
        sx={{
          mt: 1,
          mb: 2,
          pb: 1,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" color="textPrimary">
          {totalChats} Total Chats
        </Typography>
      </Box>

      <Box
        ref={listRef}
        mt={2}
        sx={{
          height: 'calc(100vh - 200px)',
          overflow: 'auto'
        }}
      >
        {loading && page === 1 ? (
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            mt={2}
          >
            Loading chats...
          </Typography>
        ) : chats.length === 0 ? (
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            mt={2}
          >
            No chats found.
          </Typography>
        ) : (
          <>
            <List disablePadding component="div">
              {chats.map((chat) => {
                const isGroup = chat.isGroup;
                const participant =
                  !isGroup && chat.participants?.find((p) => p.id !== userId);
                const displayName = isGroup
                  ? chat.name || "Group Chat"
                  : participant
                    ? `${participant.firstName} ${participant.lastName}`
                    : "Unknown";

                return (
                  <ListItemWrapper
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    }}
                  >
                    <ListItemAvatar>
                      <AvatarWithInitials
                        firstName={isGroup ? chat.name : participant?.firstName}
                        lastName={isGroup ? "" : participant?.lastName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ mr: 1 }}
                      primaryTypographyProps={{
                        color: "textPrimary",
                        variant: "h5",
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        color: "textSecondary",
                        noWrap: true,
                      }}
                      primary={displayName}
                      secondary={
                        chat.lastMessage
                          ? chat.lastMessage.content
                          : "No Recent Messages"
                      }
                    />
                    {chat.lastMessage && !chat.lastMessage?.isRead &&
                      chat.lastMessage?.sender?.id !== userId && (
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: "primary.main",
                            borderRadius: "50%",
                            ml: 2,
                            display: "inline-block",
                          }}
                          title="Unread"
                        />
                      )}
                  </ListItemWrapper>
                );
              })}
            </List>

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      <NewChatPopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </RootWrapper>
  );
}

export default SidebarContent;
