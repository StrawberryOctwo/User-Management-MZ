import { Box, Typography } from "@mui/material";

const LegendItem = ({ color, label, isDeactivated = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mr: 2 }}>
    <Box
      sx={{
        width: 16,
        height: 16,
        marginRight: 1,
        ...(isDeactivated
          ? {
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
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
          }
          : {
            backgroundColor: color
          })
      }}
    />
    <Typography variant="caption" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
  </Box>
);

const CalendarLegend = () => (
  <Box
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 1,
      padding: 1,
      border: '1px solid #e0e0e0',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, auto)',
      gap: '4px 16px',
      maxWidth: 'fit-content'
    }}
  >
    {[
      { color: '#5569ff', label: 'Online Session' },
      { color: '#ffa319', label: 'Group Session' },
      { color: '#4caf50', label: 'Individual Session' },
      { color: '#ff6347', label: 'Intensive Individual' },
      { color: '#fff4e4', label: 'Holiday' },
      { color: '', label: 'Deactivated Session', isDeactivated: true }
    ].map((item, index) => (
      <LegendItem
        key={index}
        color={item.color}
        label={item.label}
        isDeactivated={item.isDeactivated}
      />
    ))}
  </Box>
);

export default CalendarLegend;