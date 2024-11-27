// src/components/QuestionList.tsx

import React from 'react';
import { Box, Typography, List, Paper, useTheme } from '@mui/material';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { styled, alpha } from '@mui/material/styles';

// Define the structure of question types
interface QuestionType {
  id: string;
  type: string;
  icon: React.ReactElement;
}

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '250px',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const StyledList = styled(List)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  alignItems: 'center',
  padding: 0,
}));

const StyledDraggableBox = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.light, 0.1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'grab',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
    transform: 'scale(1.02)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

function QuestionList({ questionTypes }: { questionTypes: QuestionType[] }) {
  const theme = useTheme();

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom textAlign="center" color="textPrimary">
        Question Types
      </Typography>
      <Droppable droppableId="questionList" isDropDisabled={true}>
        {(provided) => (
          <StyledList
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {questionTypes.map((item, index) => (
              <Draggable key={item.id} draggableId={`question-${item.id}`} index={index}>
                {(provided, snapshot) => (
                  <StyledDraggableBox
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    aria-label={`Drag ${item.type} question`}
                    sx={{
                      backgroundColor: snapshot.isDragging
                        ? alpha(theme.palette.primary.main, 0.2)
                        : 'inherit',
                      boxShadow: snapshot.isDragging ? theme.shadows[4] : 'inherit',
                    }}
                  >
                    <IconWrapper>
                      {item.icon}
                    </IconWrapper>
                    <Typography variant="body1" fontWeight="500" color="textPrimary">
                      {item.type}
                    </Typography>
                  </StyledDraggableBox>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledList>
        )}
      </Droppable>
    </StyledPaper>
  );
}

export default QuestionList;
