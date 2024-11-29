import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemText,
  Button,
  Tooltip
} from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import Label from 'src/components/Label';
import { RootWrapper, ListItemWrapper } from './styles';
import AvatarWithInitials from '../../utils/Avatar';
import { fetchChats } from '../../utils/sidebar';
import { useAuth } from 'src/hooks/useAuth';
import { useChat } from '../../context/ChatContext';
import AddIcon from '@mui/icons-material/Add';
import NewChatPopup from './NewChatPopup';

function SidebarContent() {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const { userId } = useAuth();
  const { setChatRoomId, setParticipants } = useChat();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchChats(setChats, setLoading, searchTerm, page, limit);
    }, 300);
    return () => clearTimeout(debounceFetch);
  }, [searchTerm, page, limit]);

  const handleChatClick = (chat) => {
    setChatRoomId(chat.id);
    setParticipants(chat.participants || []);
  };

  const handleNewChatClick = () => {
    setIsPopupOpen(true);
  };

  const handleSelectUser = (user) => {
    // Handle user selection logic here
    console.log('Selected user:', user);
  };

  return (
    <RootWrapper>
      <Box
        sx={{
          display: 'flex',
          alignContent: 'center',
          mb: 2,
          mt: 1,
          gap: 2
        }}
      >
        <TextField
          sx={{
            mb: 1
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
            )
          }}
          placeholder="Search..."
        />
        <Tooltip title="New Chat" arrow>
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: 'auto',
              padding: '6px',
              width: '36px',
              height: '36px'
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
          textAlign: 'center'
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
                ? chat.name || 'Group Chat'
                : participant
                ? `${participant.firstName} ${participant.lastName}`
                : 'Unknown';

              return (
                <ListItemWrapper
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                  }}
                >
                  <ListItemAvatar>
                    <AvatarWithInitials
                      firstName={isGroup ? chat.name : participant?.firstName}
                      lastName={isGroup ? '' : participant?.lastName}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    sx={{
                      mr: 1
                    }}
                    primaryTypographyProps={{
                      color: 'textPrimary',
                      variant: 'h5',
                      noWrap: true
                    }}
                    secondaryTypographyProps={{
                      color: 'textSecondary',
                      noWrap: true
                    }}
                    primary={displayName}
                    secondary={
                      typeof chat.lastMessage.content === 'string'
                        ? chat.lastMessage.content
                        : 'No Recent Messages'
                    }
                  />
                  {chat.unreadCount > 0 && (
                    <Label color="primary">
                      <b>{chat.unreadCount}</b>
                    </Label>
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
