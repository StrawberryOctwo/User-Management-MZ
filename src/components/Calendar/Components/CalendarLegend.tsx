import React, { useState } from "react";
import { Box, Typography, IconButton, Popover } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

// LegendItem Component
const LegendItem = ({ color, label, isDeactivated = false }) => (

  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mr: 2 }}>
    <Box
      sx={{
        width: 16,
        height: 16,
        marginRight: 1,
        borderRadius: '2px',
        ...(isDeactivated
          ? {
              backgroundColor: '#fff',
              border: '3px solid #e0e0e0',
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
                )`,
            }
          : {
              backgroundColor: color,
            }),
      }}
    />
    <Typography variant="caption" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
  </Box>
);

// CalendarLegend Component
const CalendarLegend = () => {
  const { t } = useTranslation(); // Import t here
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 1,
        padding: 2,
        border: '1px solid #e0e0e0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '8px 24px',
        maxWidth: '300px',
      }}
    >
      {[
        { color: '#5569ff', label: t('Online Session') },
        { color: '#ffa319', label: t('Group Session') },
        { color: '#4caf50', label: t('Individual Session') },
        { color: '#ff6347', label: t('Intensive Individual') },
        { color: '#fff4e4', label: t('Holiday') },
        { color: '', label: t('Deactivated Session'), isDeactivated: true },
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
};


// CalendarLegendWithInfo Component
const CalendarLegendWithInfo = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle opening the popover
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
<Box
  sx={(theme) => ({
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.primary.main, // Access theme.primary.main
    borderRadius: 25,
    padding: 1,
    boxShadow: 1,
    opacity: 0.4, // Initial transparency
    transition: "opacity 0.3s ease-in-out", // Smooth transition
    '&:hover': {
      opacity: 1, // Fully visible on hover
    },
  })}
>
      <IconButton
        size="small"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        aria-owns={open ? 'calendar-legend-popover' : undefined}
        aria-haspopup="true"
        aria-label="Calendar Legend"
      >
        <InfoOutlinedIcon fontSize="small" sx={{ color: 'white'}} />
      </IconButton>
      <Popover
        id="calendar-legend-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        PaperProps={{
          onMouseEnter: handlePopoverOpen,
          onMouseLeave: handlePopoverClose,
          sx: { padding: 1 },
        }}
      >
        <CalendarLegend />
      </Popover>
    </Box>
  );
};

export default CalendarLegendWithInfo;
