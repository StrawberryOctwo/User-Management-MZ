import { Box, Avatar, Typography } from '@mui/material';
import { RootWrapper } from './styles';

function TopBarContent() {
  return (
    <RootWrapper>
      <Box display="flex" alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 48,
            height: 48
          }}
          alt="Zain Baptista"
          src="/static/images/avatars/1.jpg"
        />
        <Box ml={1}>
          <Typography variant="h4">Zain Baptista</Typography>
        </Box>
      </Box>
    </RootWrapper>
  );
}

export default TopBarContent;
