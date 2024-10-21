import React, { useState } from "react";
import { Box, Button, IconButton, Typography, Slider, MenuItem, Select, TextField } from "@mui/material";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import moment from "moment";
import { VIEW_OPTIONS } from "../../constants";
import AddClassSessionModal from "../Appointment/AddClassSessionModal";
import RoleBasedComponent from "src/components/ProtectedComponent";

type ToolbarControlsProps = {
  date: Date;
  zoom: number; // Change from number[] to number
  setZoom: (value: number) => void; // Update to accept a single number
  setDate: (date: Date) => void;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  setView: any;
  view: string;
  dateText: any;

};


export default function ToolbarControls({
  date,
  zoom,
  setZoom,
  setDate,
  onTodayClick,
  onPrevClick,
  onNextClick,
  setView,
  view,
  dateText,
}: ToolbarControlsProps) {
  const PRIMARY_COLOR = "#17405d";
  const SECONDARY_COLOR = "#246899";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Handler to open the modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Handler to save the new class session
  const handleSaveClassSession = (newSession: any) => {
    setIsAddModalOpen(false);
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton size="small" onClick={() => setZoom(Math.max(zoom - 1, 4))}>
          <ZoomOutIcon />
        </IconButton>
        <Slider
          value={zoom}
          onChange={(e, value) => setZoom(value as number)}
          min={4}
          max={20}
          sx={{ width: 150, color: PRIMARY_COLOR }}
        />
        <IconButton size="small" onClick={() => setZoom(Math.min(zoom + 1, 20))}>
          <ZoomInIcon />
        </IconButton>
      </Box>

      <Box>
        <TextField
          type="date"
          value={moment(date).format('YYYY-MM-DD')}
          onChange={(e) => setDate(new Date(e.target.value))}
          InputProps={{
            style: {
              borderRadius: '4px',
              borderColor: PRIMARY_COLOR,
            },
          }}
          size="small"
        />
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <Button onClick={onTodayClick} variant="outlined" sx={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
          Today
        </Button>
        <IconButton aria-label="Previous" onClick={onPrevClick}>
          <ArrowLeft />
        </IconButton>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          // bgcolor={PRIMARY_COLOR}
          color={PRIMARY_COLOR}
          borderRadius={1}
        >
          <Typography>{dateText}</Typography>
        </Box>
        <IconButton aria-label="Next" onClick={onNextClick}>
          <ArrowRight />
        </IconButton>
      </Box>

      <Box display="flex" gap={1}>
        {VIEW_OPTIONS.map(({ id, label }) => (
          <Button
            key={id}
            onClick={() => setView(id)}
            variant={id === view ? "contained" : "outlined"}
            sx={{
              bgcolor: id === view ? PRIMARY_COLOR : 'transparent',
              color: id === view ? "white" : PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              '&:hover': {
                bgcolor: id === view ? SECONDARY_COLOR : '#f0f0f0',
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>


      <RoleBasedComponent allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin']}>
        <Button
          variant="contained"
          sx={{ ml: 2, bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: SECONDARY_COLOR } }}
          onClick={handleOpenAddModal}
        >
          Add Class Session
        </Button>
      </RoleBasedComponent>

      {/* Render the Add Class Session Modal */}
      <AddClassSessionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveClassSession}
        initialStartDate={date}
        initialEndDate={moment(date).add(1, 'hour').toDate()} // Example default for end date
      />
    </Box>
  );
}
