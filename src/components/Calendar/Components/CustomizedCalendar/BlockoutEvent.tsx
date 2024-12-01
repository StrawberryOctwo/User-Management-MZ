import { Typography, Box } from '@mui/material';
import { Blockout } from '../../types';

export default function BlockoutEvent({ blockout }: { blockout: Blockout }) {
  return (
    <Box
      sx={{
        backgroundColor: 'lightgray',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography
        color="gray"
        fontWeight="bold"
        fontSize="small"
        textAlign="center"
      >
        {blockout.name}
      </Typography>
    </Box>
  );
}
