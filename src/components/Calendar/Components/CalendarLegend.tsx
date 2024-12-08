import { Box, Typography } from "@mui/material";

const CalendarLegend = () => (
  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#5569ff', marginRight: 1 }} />
      <Typography variant="body2">Online Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffa319', marginRight: 1 }} />
      <Typography variant="body2">Group Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', marginRight: 1 }} />
      <Typography variant="body2">Individual Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff6347', marginRight: 1 }} />
      <Typography variant="body2">Intensive Individual Session</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#fff4e4', marginRight: 1 }} />
      <Typography variant="body2">Holiday</Typography>
    </Box>

    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 20,
            height: 20,
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            marginRight: 1,
            background: `
           linear-gradient(
             to top left,
             rgba(255, 0, 0, 0) 0%,
             rgba(255, 0, 0, 0) calc(50% - 0.8px),
             rgba(255, 0, 0, 1) 50%,
             rgba(255, 0, 0, 0) calc(50% + 0.8px),
             rgba(255, 0, 0, 0) 100%
           ),
           linear-gradient(
             to top right,
             rgba(255, 0, 0, 0) 0%,
             rgba(255, 0, 0, 0) calc(50% - 0.8px),
             rgba(255, 0, 0, 1) 50%,
             rgba(255, 0, 0, 0) calc(50% + 0.8px),
             rgba(255, 0, 0, 0) 100%
           )`
          }}
        />
        <Typography variant="body2">Deactivated Session</Typography>
      </Box>
    </Box>
  </Box>
);

export default CalendarLegend;
