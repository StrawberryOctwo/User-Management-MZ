import { Typography, Box } from '@mui/material';
import { Blockout } from '../../types';
import { t } from "i18next"

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
        {t(blockout.name)}
      </Typography>
    </Box>
  );
}
