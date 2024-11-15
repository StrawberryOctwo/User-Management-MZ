// QuestionList.tsx
import { Box, Typography, List, Paper } from '@mui/material';
import { Draggable, Droppable } from 'react-beautiful-dnd';

function QuestionList({ questionTypes }) {
  return (
    <Paper
      elevation={3}
      sx={{
        width: '250px',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" gutterBottom textAlign="center">
        Question Types
      </Typography>
      <Droppable droppableId="questionList" isDropDisabled={true}>
        {(provided) => (
          <List
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            {questionTypes.map((item, index) => (
              <Draggable key={item.id} draggableId={`question-${item.id}`} index={index}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      p: 2,
                      width: '100%',
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 1,
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'background-color 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {item.type}
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </Paper>
  );
}

export default QuestionList;
