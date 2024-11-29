import { Box, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import { useChat } from '../../context/ChatContext';
import AvatarWithInitials from '../../utils/Avatar';
import { RootWrapper } from './styles';

function TopBarContent() {
  const { chatRoomId, participants } = useChat();
  const { userId } = useAuth();

  // Filter out the current user from participants for display purposes
  const otherParticipants = participants.filter(
    (participant) => participant.id !== userId
  );

  const isGroup = participants.length > 2; // More than 2 participants implies a group chat
  const participant =
    !isGroup && otherParticipants.length === 1 ? otherParticipants[0] : null;

  const displayName = isGroup
    ? 'Group Chat'
    : participant
    ? `${participant.firstName} ${participant.lastName}`
    : 'Select a Chat';

  return (
    <RootWrapper>
      {chatRoomId ? (
        <Box display="flex" alignItems="center">
          <AvatarWithInitials
            firstName={isGroup ? 'G' : participant?.firstName}
            lastName={isGroup ? 'C' : participant?.lastName}
          />
          <Box ml={1}>
            <Typography variant="h4">{displayName}</Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="h5" textAlign="center">
          No Chat Selected
        </Typography>
      )}
    </RootWrapper>
  );
}

export default TopBarContent;
