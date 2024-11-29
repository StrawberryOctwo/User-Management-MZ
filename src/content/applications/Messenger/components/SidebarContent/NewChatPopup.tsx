import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Box
} from '@mui/material';

interface NewChatPopupProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => void;
}

const users = [
  { id: 1, firstName: 'John', lastName: 'Doe' },
  { id: 2, firstName: 'Jane', lastName: 'Smith' },
  { id: 3, firstName: 'Alice', lastName: 'Johnson' }
];

const NewChatPopup: React.FC<NewChatPopupProps> = ({
  open,
  onClose,
  onSelectUser
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select a User to Chat</DialogTitle>
      <DialogContent>
        <List>
          {users.map((user) => (
            <ListItem
              button
              key={user.id}
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`${user.firstName} ${user.lastName}`} />
            </ListItem>
          ))}
        </List>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatPopup;
