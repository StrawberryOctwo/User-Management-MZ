import { Button, Box, Typography, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { createSurvey, updateSurvey } from 'src/services/survey'; // Import both functions

interface SurveySubmitProps {
  surveyId?: string; // Optional surveyId for editing
  titleProp?: string; // Initial title, if editing
  questions: { text: string; type: string; options: string[] }[];
  onSubmitSuccess: () => void;
}

function SurveySubmit({ surveyId, titleProp = '', questions, onSubmitSuccess }: SurveySubmitProps) {
  const [title, setTitle] = useState(titleProp);

  useEffect(() => {
    if (titleProp) {
      setTitle(titleProp); // Set title to survey title if editing
    }
  }, [titleProp]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please provide a survey title.");
      return;
    }

    try {
      let response;
      if (surveyId) {
        // Update survey if surveyId exists
        response = await updateSurvey(surveyId, title, questions);
        if (response) {
          console.log("Survey updated successfully!");
        }
      } else {
        // Create new survey if no surveyId
        response = await createSurvey(title, questions);
        if (response) {
          console.log("Survey submitted successfully!");
        }
      }
      onSubmitSuccess();
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
        {surveyId ? "Update Survey" : "Review & Submit Your Survey"}
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
        Please review your questions before {surveyId ? "updating" : "submitting"}. 
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSubmit}
        sx={{ mt: 2, width: '50%' }}
      >
        {surveyId ? "Update Survey" : "Submit Survey"}
      </Button>
    </Box>
  );
}

export default SurveySubmit;
