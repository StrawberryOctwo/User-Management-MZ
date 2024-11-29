import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import Label from 'src/components/Label';
import { RootWrapper, ListItemWrapper } from './styles';
import AvatarWithInitials from '../../utils/Avatar';
import { fetchChats } from '../../utils/sidebar';

function SidebarContent() {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchChats(setChats, setLoading, searchTerm);
    }, 300);
    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

  return (
    <RootWrapper>
      <Typography
        sx={{
          mb: 1,
          textAlign: 'center'
        }}
        variant="h3"
      >
        Chats
      </Typography>
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
        ): chats.length === 0 ? (
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
            {chats.map((chat) => (
              <ListItemWrapper key={chat.id}>
                <ListItemAvatar>
                  <AvatarWithInitials
                    firstName={chat.firstName}
                    lastName={chat.lastName}
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
                  primary={`${chat.firstName} ${chat.lastName}`}
                  secondary={chat.lastMessage}
                />
                {chat.unreadCount > 0 && (
                  <Label color="primary">
                    <b>{chat.unreadCount}</b>
                  </Label>
                )}
              </ListItemWrapper>
            ))}
          </List>
        )}
      </Box>
    </RootWrapper>
  );
}

export default SidebarContent;
