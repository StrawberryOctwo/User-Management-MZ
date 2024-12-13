// src/components/DropArea.tsx

import { Box, Typography, Modal, Paper, Button, IconButton, List, ListItem, MenuItem } from '@mui/material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import TextInputQuestion from './QuestionTypes/TextInputQuestion';
import CheckboxQuestion from './QuestionTypes/CheckboxQuestion';
import DropdownQuestion from './QuestionTypes/DropdownQuestion';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { t } from "i18next"

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
}

interface DropAreaProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const StyledDroppableBox = styled(Box)(({ theme, isDraggingOver }: { theme: any; isDraggingOver: boolean }) => ({
  padding: theme.spacing(2),
  backgroundColor: isDraggingOver ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: isDraggingOver ? `2px dashed ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  minHeight: '300px',
  width: '100%',
  textAlign: 'center',
  transition: 'background-color 0.2s ease, border 0.2s ease',
  overflowY: 'auto',
  maxHeight: '60vh', // Adjusted maxHeight for better usability
  // Custom scrollbar styling
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
}));

const StyledDraggablePaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  textAlign: 'left', // Changed to left for better readability
  wordWrap: 'break-word',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    boxShadow: theme.shadows[3],
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2),
}));

const EditButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

function DropArea({ questions, onEdit, onDelete }: DropAreaProps) {
  const theme = useTheme();
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const handleEditClick = (question: Question) => {
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
        <StyledDroppableBox ref={provided.innerRef} {...provided.droppableProps} isDraggingOver={snapshot.isDraggingOver}>
          {questions.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              Drag and drop a question here to start building your survey.
            </Typography>
          )}

          {questions.map((question, index) => (
            <Draggable key={question.id} draggableId={question.id} index={index}>
              {(provided, snapshot) => (
                <StyledDraggablePaper
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  sx={{
                    backgroundColor: snapshot.isDragging ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                    boxShadow: snapshot.isDragging ? theme.shadows[4] : 'inherit',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {question.text || `${question.type} Question`}
                  </Typography>

                  {/* Render based on question type */}
                  {question.type === 'Text Input' && (
                    <Typography variant='body1' color="textSecondary">
                      {'Answer Goes Here'}
                    </Typography>
                  )}
                  {question.type === 'Dropdown' && (
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Answer (Select One):
                      </Typography>
                      <List>
                        {question.options.map((option, idx) => (
                          <MenuItem key={idx} value={option}>
                            {option || 'Dropdown Option'}
                          </MenuItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {question.type === 'Checkbox' && (
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Answer (Select Multiple):
                      </Typography>
                      <List>
                        {question.options.map((option, idx) => (
                          <ListItem key={idx} disableGutters>
                            <input type="checkbox" /> {option || 'Checkbox Option'}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Action buttons */}
                  <ActionButtons>
                    <EditButton
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditClick(question)}
                    >
                      Edit
                    </EditButton>
                    <IconButton
                      onClick={() => onDelete(question.id)}
                      aria-label={`delete ${question.text || question.type}`}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ActionButtons>
                </StyledDraggablePaper>
              )}
            </Draggable>
          ))}
          {provided.placeholder}

          {/* Modal for editing question */}
          <Modal open={isModalOpen} onClose={handleModalClose} aria-labelledby="edit-question-modal" aria-describedby="edit-question-form">
            <Box
              p={3}
              bgcolor="background.paper"
              borderRadius={2}
              maxWidth={400}
              width="90%"
              mx="auto"
              my="10vh"
              position="relative"
              boxShadow={24}
            >
              <IconButton
                aria-label="close"
                onClick={handleModalClose}
                sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" mb={2}>Customize Question</Typography>
              {currentQuestion && (
                <>
                  {currentQuestion.type === 'Text Input' && (
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
                  <Button
                    variant="contained"
                    onClick={handleSaveQuestion}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {t("save")}
                  </Button>
                </>
              )}
            </Box>
          </Modal>
        </StyledDroppableBox>
      )}
    </Droppable>
  );
}

export default DropArea;
