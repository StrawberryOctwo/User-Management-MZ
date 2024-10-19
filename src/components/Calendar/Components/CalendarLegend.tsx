import { Box, Typography } from "@mui/material";

const CalendarLegend = () => (
  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#e1bee7', marginRight: 1 }} />
      <Typography variant="body2">Online Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffecb3', marginRight: 1 }} />
      <Typography variant="body2">Group Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#c8e6c9', marginRight: 1 }} />
      <Typography variant="body2">1-on-1 Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#bee2fa', marginRight: 1 }} />
      <Typography variant="body2">Pending Status</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#c7edca', marginRight: 1 }} />
      <Typography variant="body2">Checked-In Status</Typography>
    </Box>
  </Box>
);

export default CalendarLegend;
