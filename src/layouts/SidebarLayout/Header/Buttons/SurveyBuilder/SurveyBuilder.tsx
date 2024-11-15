import { useRef, useState } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import SurveyBuilderDialog from './SurveyBuilderDialog';

function SurveyBuilder() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const ref = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip arrow title="Open Survey Builder">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <BuildIcon />
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
