// DropArea.tsx
import { Box, Typography, Modal, Paper, Button, IconButton, List, ListItem, MenuItem } from '@mui/material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import TextInputQuestion from './QuestionTypes/TextInputQuestion';
import CheckboxQuestion from './QuestionTypes/CheckboxQuestion';
import DropdownQuestion from './QuestionTypes/DropdownQuestion';

function DropArea({ questions, onEdit, onDelete }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
    console.log(questions)
  const handleEditClick = (question) => {
    setCurrentQuestion(question);
    setModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (currentQuestion) {
      onEdit(currentQuestion);
      setModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCurrentQuestion(null);
  };

  return (
    <Droppable droppableId="dropArea">
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          p={2}
          bgcolor="background.default"
          borderRadius={1}
          border={snapshot.isDraggingOver ? '2px dashed' : '1px solid'}
          borderColor={snapshot.isDraggingOver ? 'primary.main' : 'divider'}
          minHeight="300px"
          width="100%"
          textAlign="center"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            overflowY: 'auto',
            maxHeight: '100vh',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >
          {questions.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              Drag and drop a question here to start building your survey.
            </Typography>
          )}

          {questions.map((question, index) => (
            <Draggable key={question.id} draggableId={String(question.id)} index={index}>
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  sx={{
                    width: '80%', // Stretch more horizontally
                    maxWidth: '600px',
                    p: 3,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    textAlign: 'center',
                    wordWrap: 'break-word', // Wrap long text to prevent overflow
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {question.text || `${question.type} Question`}
                  </Typography>
                  
                  {/* Render based on question type */}
                  {question.type === 'TextInput' && (
                    <Typography variant='body1' color="textSecondary">
                      {'Answer Goes Here'}
                    </Typography>
                  )}
                  {question.type === 'Dropdown' && (
                    <Box width="100%">
                      <Typography variant="body2" color="textSecondary">
                        Answer (Select One):
                      </Typography>
                      <List>
                        {question.options?.map((option, idx) => (
                          <MenuItem key={idx} value={option}>
                            {option || 'Dropdown Option'}
                          </MenuItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {question.type === 'Checkbox' && (
                    <Box width="100%">
                      <Typography variant="body2" color="textSecondary">
                        Answer (Select Multiple):
                      </Typography>
                      <List>
                        {question.options?.map((option, idx) => (
                          <ListItem key={idx}>
                            <input type="checkbox" /> {option || 'Checkbox Option'}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Action buttons aligned to the right */}
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditClick(question)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <IconButton onClick={() => onDelete(question.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              )}
            </Draggable>
          ))}
          {provided.placeholder}

          {/* Modal for editing question */}
          <Modal open={isModalOpen} onClose={handleModalClose}>
            <Box p={3} bgcolor="background.paper" borderRadius={2} m="auto" maxWidth={400} position="relative">
              <IconButton
                aria-label="close"
                onClick={handleModalClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" mb={2}>Customize Question</Typography>
              {currentQuestion && (
                <>
                  {currentQuestion.type === 'TextInput' && (
                    <TextInputQuestion
                      question={currentQuestion}
                      onChange={(updatedQuestion) => setCurrentQuestion(updatedQuestion)}
                    />
                  )}
                  {currentQuestion.type === 'Dropdown' && (
                    <DropdownQuestion
                      question={currentQuestion}
                      onChange={(updatedQuestion) => setCurrentQuestion(updatedQuestion)}
                    />
                  )}
                  {currentQuestion.type === 'Checkbox' && (
                    <CheckboxQuestion
                      question={currentQuestion}
                      onChange={(updatedQuestion) => setCurrentQuestion(updatedQuestion)}
                    />
                  )}
                  <Button variant="contained" onClick={handleSaveQuestion} sx={{ mt: 2 }}>
                    Save
                  </Button>
                </>
              )}
            </Box>
          </Modal>
        </Box>
      )}
    </Droppable>
  );
}

export default DropArea;
