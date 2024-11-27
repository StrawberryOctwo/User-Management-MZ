// src/components/SurveyBuilderDialog.tsx
import CloseIcon from '@mui/icons-material/Close';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import Header from './Header';
import QuestionList from './QuestionList';
import DropArea from './DropArea';
import SurveySubmit from './SurveySubmit';
import { styled, alpha } from '@mui/material/styles';

// Import required icons
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// Define interfaces
interface SurveyBuilderDialogProps {
  open: boolean;
  onClose: () => void;
  survey?: Survey;
}

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
}

interface Survey {
  id: string;
  title: string;
  questions: Question[];
}

// Define available question types with icons
interface QuestionType {
  id: string;
  type: string;
  icon: React.ReactElement;
}

const questionTypes: QuestionType[] = [
  { id: '1', type: 'Text Input', icon: <TextFieldsIcon /> },
  { id: '2', type: 'Dropdown', icon: <ArrowDropDownCircleIcon /> },
  { id: '3', type: 'Checkbox', icon: <CheckBoxIcon /> },
];

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows[5],
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
  padding: theme.spacing(3),
  gap: theme.spacing(3),
  backgroundColor: alpha(theme.palette.grey[100], 0.5),
}));

const FooterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

// Main Component
function SurveyBuilderDialog({ open, onClose, survey }: SurveyBuilderDialogProps) {
  const theme = useTheme();
  const [questions, setQuestions] = useState<Question[]>(survey?.questions || []);

  // Update questions when survey prop changes
  useEffect(() => {
    if (survey) {
      setQuestions(survey.questions);
    }
  }, [survey]);

  // Handle deletion of a question
  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Handle editing of a question
  const handleEditQuestion = (updatedQuestion: Question) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  // Handle drag end event for reordering questions
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    // Reordering within the DropArea
    if (source.droppableId === 'dropArea' && destination.droppableId === 'dropArea') {
      const reorderedQuestions = Array.from(questions);
      const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
      reorderedQuestions.splice(destination.index, 0, movedQuestion);
      setQuestions(reorderedQuestions);
      return;
    }

    // Adding a new question from the QuestionList to the DropArea
    if (source.droppableId === 'questionList' && destination.droppableId === 'dropArea') {
      const draggedItemId = result.draggableId.replace('question-', '');
      const questionType = questionTypes.find((item) => item.id === draggedItemId)?.type;

      const newQuestion: Question = {
        id: uuidv4(),
        type: questionType || '',
        text: '',
        options: questionType === 'Dropdown' || questionType === 'Checkbox' ? ['Option 1', 'Option 2'] : [],
      };

      setQuestions((prevQuestions) => {
        const updatedQuestions = Array.from(prevQuestions);
        updatedQuestions.splice(destination.index, 0, newQuestion);
        return updatedQuestions;
      });
    }
  };

  // Handle successful submission of the survey
  const handleSurveySubmitSuccess = () => {
    // Optionally reset the form or provide feedback
    setQuestions([]);
    onClose();
  };

  return (
    <StyledDialog fullScreen open={open} onClose={onClose}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <ContentContainer>
          {/* Header Section */}
          <HeaderContainer>
            <Typography variant="h5" fontWeight="bold">
              {survey ? 'Edit Survey' : 'Create New Survey'}
            </Typography>
            <IconButton onClick={onClose} aria-label="close dialog" sx={{ color: 'inherit' }}>
              <CloseIcon />
            </IconButton>
          </HeaderContainer>
          <Divider />

          {/* Main Content: Question List and Drop Area */}
          <MainContent>
            {/* Question List */}
            <QuestionList questionTypes={questionTypes} />

            {/* Drop Area */}
            <DropArea
              questions={questions}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          </MainContent>

          {/* Footer: Submit Button */}
          <FooterContainer>
            <SurveySubmit
              surveyId={survey?.id}
              titleProp={survey?.title}
              questions={questions}
              onSubmitSuccess={handleSurveySubmitSuccess}
            />
          </FooterContainer>
        </ContentContainer>
      </DragDropContext>
    </StyledDialog>
  );
}

export default SurveyBuilderDialog;
