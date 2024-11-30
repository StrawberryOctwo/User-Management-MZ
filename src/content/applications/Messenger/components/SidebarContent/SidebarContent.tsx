import React, { useEffect, useState } from "react";
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
import { RootWrapper, ListItemWrapper } from "./styles";
import AvatarWithInitials from "../../utils/Avatar";
import { fetchChats } from "../../utils/sidebar";
import { useAuth } from "src/hooks/useAuth";
import { useChat } from "../../context/ChatContext";
import AddIcon from "@mui/icons-material/Add";
import NewChatPopup from "./NewChatPopup";
import { socket } from "src/utils/webSocketProvider";
import { resetUnreadCount } from "src/services/chatService";

function SidebarContent() {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();
  const { setChatRoomId, setParticipants } = useChat();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch chats
  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchChats(setChats, setLoading, searchTerm, page, limit);

    }, 300);
    return () => clearTimeout(debounceFetch);
  }, [searchTerm, page, limit]);

  useEffect(() => {
    // Join user-specific room for receiving updates
    socket.emit("join_room", `user_${userId}`);
  
    socket.on("chat_updated", (updatedChat) => {
      console.log("Received chat_updated:", updatedChat); // Log the event
  
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat.id === updatedChat.id
        );
  
        let updatedChats;
  
        if (chatIndex !== -1) {
          // Update the existing chat
          updatedChats = [...prevChats];
          updatedChats[chatIndex] = {
            ...prevChats[chatIndex],
            lastMessage: updatedChat.lastMessage,
          };
        } else {
          // Add the new chat if it doesn't already exist
          updatedChats = [...prevChats, updatedChat];
        }
  
        // Sort chats by lastMessage.sentAt in descending order
        return updatedChats.sort((a, b) => {
          const dateA = new Date(a.lastMessage?.sentAt || 0).getTime();
          const dateB = new Date(b.lastMessage?.sentAt || 0).getTime();
          return dateB - dateA; // Descending order
        });
        
      });
    });
  
    return () => {
      socket.off("chat_updated");
    };
  }, [userId]);
  

  // Handle chat click
  const handleChatClick = async (chat) => {
    setChatRoomId(chat.id);
    setParticipants(chat.participants || []);

    try {
      // Reset unread messages
      await resetUnreadCount(chat.id);
      console.log("Unread messages reset successfully.");
    } catch (error) {
      console.error("Failed to reset unread messages:", error);
    }

    // Update the lastMessage.isRead in the chat state
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

  const handleSelectUser = (user) => {
    console.log("Selected user:", user);
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
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchTwoToneIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Search..."
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
          {chats.length} Total Chats
        </Typography>
      </Box>

      <Box mt={2}>
        {loading ? (
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
                        width: 12, // Diameter of the circle
                        height: 12, // Diameter of the circle
                        backgroundColor: "primary.main", // Use theme primary color
                        borderRadius: "50%", // Makes it a circle
                        ml: 2, // Margin-left for spacing
                        display: "inline-block", // Keeps it inline with other elements
                      }}
                      title="Unread" // Tooltip text for accessibility
                    />

                    )}
                </ListItemWrapper>
              );
            })}
          </List>
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
