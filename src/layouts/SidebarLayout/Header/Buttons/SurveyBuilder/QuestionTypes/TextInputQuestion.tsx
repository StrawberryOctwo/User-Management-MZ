// src/components/QuestionTypes/TextInputQuestion.tsx

import { TextField, Box } from '@mui/material';
import React from 'react';

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
}

interface TextInputQuestionProps {
  question: Question;
  onChange: (updatedQuestion: Question) => void;
}

const TextInputQuestion: React.FC<TextInputQuestionProps> = ({ question, onChange }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedText = e.target.value;
    onChange({ ...question, text: updatedText });
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Question Text"
        variant="outlined"
        value={question.text}
        onChange={handleTextChange}
      />
    </Box>
  );
};

export default TextInputQuestion;
