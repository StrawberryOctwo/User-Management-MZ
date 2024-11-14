// SurveyBuilderDialog.tsx
import { Box, Dialog, Divider } from '@mui/material';
import { DragDropContext } from 'react-beautiful-dnd';
import { useEffect, useState } from 'react';
import Header from './Header';
import QuestionList from './QuestionList';
import DropArea from './DropArea';
import SurveySubmit from './SurveySubmit';
import { v4 as uuidv4 } from 'uuid';

interface SurveyBuilderDialogProps {
  open: boolean;
  onClose: () => void;
  survey?:Survey
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
const questionTypes = [
  { id: '1', type: 'TextInput' },
  { id: '2', type: 'Dropdown' },
  { id: '3', type: 'Checkbox' },
];

function SurveyBuilderDialog({ open, onClose, survey }: SurveyBuilderDialogProps) {
  const [questions, setQuestions] = useState(survey?.questions || []); // Initialize with survey data if in edit mode

  console.log(questions,survey)
  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };
  
  const handleEditQuestion = (updatedQuestion) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    );
  };
  
  useEffect(() => {
    if (survey) {
      setQuestions(survey.questions);
    }
  }, [survey]);
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === 'dropArea' && destination.droppableId === 'dropArea') {
      const reorderedQuestions = Array.from(questions);
      const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
      reorderedQuestions.splice(destination.index, 0, movedQuestion);
      setQuestions(reorderedQuestions);
      return;
    }

    if (source.droppableId === 'questionList' && destination.droppableId === 'dropArea') {
      const draggedItemId = result.draggableId.replace('question-', '');
      const questionType = questionTypes.find((item) => item.id === draggedItemId)?.type;

      const newQuestion = {
        id: uuidv4(),
        type: questionType || '',
        text: '',
        options: [],
      };

      setQuestions((prevQuestions) => {
        const updatedQuestions = Array.from(prevQuestions);
        updatedQuestions.splice(destination.index, 0, newQuestion);
        return updatedQuestions;
      });
    }
  };

  const handleSurveySubmitSuccess = () => {
    // Clear the survey or provide feedback on success
    setQuestions([]);
    onClose(); // Close the dialog on successful submit
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display="flex" flexDirection="column" height="100%">
          <Header title="Survey Builder" onClose={onClose} />
          <Divider />
          <Box display="flex" flexGrow={1} overflow="hidden">
            <QuestionList questionTypes={questionTypes} />
            <DropArea questions={questions} onEdit={handleEditQuestion} onDelete={handleDeleteQuestion} />
          </Box>
          {/* Render the SurveySubmit component */}
          <SurveySubmit
            surveyId={survey?.id} // Pass surveyId for updates
            titleProp={survey?.title} // Set the initial title if editing
            questions={questions}
            onSubmitSuccess={handleSurveySubmitSuccess}
          />     
             </Box>
      </DragDropContext>
    </Dialog>
  );
}

export default SurveyBuilderDialog;
