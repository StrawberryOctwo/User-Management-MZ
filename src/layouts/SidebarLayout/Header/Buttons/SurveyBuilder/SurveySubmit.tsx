import { Button, Box, Typography, TextField } from '@mui/material';
import { useState } from 'react';
import { createSurvey } from 'src/services/survey';

interface SurveySubmitProps {
  questions: { text: string; type: string; options: string[] }[]; // Adjusted type for questions
  onSubmitSuccess: () => void;
}

function SurveySubmit({ questions, onSubmitSuccess }: SurveySubmitProps) {
  const [title, setTitle] = useState(''); // State for survey title

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please provide a survey title.");
      return;
    }

    try {
      const response = await createSurvey(title, questions); // Pass the title with questions
      
      if (response) {
        console.log("Survey submitted successfully!");
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
    }
  };

  return (
    <Box 
      mt={1}
      mb={2}
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="background.paper"
      borderRadius={2}
      boxShadow={1}
      maxWidth="400px"
      mx="auto"
      textAlign="center"
    >
      <Typography variant="h5" gutterBottom>
        Review & Submit Your Survey
      </Typography>
      <TextField 
        fullWidth
        label="Survey Title"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Typography variant="body2" color="textSecondary" mb={1}>
        Please review your questions before submitting. Click "Submit Survey" when you're ready.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSubmit}
        sx={{ mt: 2, width: '50%' }}
      >
        Submit Survey
      </Button>
    </Box>
  );
}

export default SurveySubmit;
