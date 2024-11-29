import { Box, Avatar, Typography } from '@mui/material';
import { RootWrapper } from './styles';
import AvatarWithInitials from '../../utils/Avatar';

function TopBarContent() {
  return (
    <RootWrapper>
      <Box display="flex" alignItems="center">
        <AvatarWithInitials firstName="Zain" lastName="Baptista" />
        <Box ml={1}>
          <Typography variant="h4">Zain Baptista</Typography>
        </Box>
      </Box>
    </RootWrapper>
  );
}

export default TopBarContent;
