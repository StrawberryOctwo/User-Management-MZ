import { useRef, useState } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import SurveyBuilderDialog from './SurveyBuilderDialog';
import ConstructionIcon from '@mui/icons-material/Construction';
function SurveyBuilder() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const ref = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip arrow title="Survey Builder">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <ConstructionIcon />
        </IconButton>
      </Tooltip>

      {/* Wrap SurveyBuilderDialog with DragDropContext */}
      {isOpen && (
        <SurveyBuilderDialog open={isOpen} onClose={handleClose} />
      )}
    </>
  );
}

export default SurveyBuilder;
