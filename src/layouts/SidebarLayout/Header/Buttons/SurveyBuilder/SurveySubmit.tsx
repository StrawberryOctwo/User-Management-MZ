// src/components/SurveySubmit.tsx

import { Button, Box, Typography, TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';
import { useState, useEffect } from 'react';
import { createSurvey, updateSurvey } from 'src/services/survey'; // Ensure these functions are correctly implemented
import { styled } from '@mui/material/styles';

interface SurveySubmitProps {
  surveyId?: string; // Optional surveyId for editing
  titleProp?: string; // Initial title, if editing
  questions: { text: string; type: string; options: string[] }[];
  onSubmitSuccess: () => void;
}

// Styled Components
const StyledBox = styled(Box)(({ theme }) => ({
  mt: theme.spacing(1),
  mb: theme.spacing(1),
  padding: theme.spacing(1.5), // Reduced padding from 2 to 1.5
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch', // Changed to stretch for full-width elements
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  maxWidth: 300, // Reduced maxWidth from 350px to 300px
  margin: '0 auto', // Centers the box horizontally
  textAlign: 'center',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  variant: 'h6',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5), // Reduced bottom margin
  fontSize: '1.1rem', // Slightly smaller font size
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(1), // Reduced bottom margin
  '& .MuiInputBase-input': {
    padding: theme.spacing(1), // Adjusted padding for compactness
    fontSize: '0.9rem', // Smaller font size
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(0.5), // Reduced top margin
  width: '100%', // Full width for better alignment and touch targets
  padding: theme.spacing(1), // Adjusted padding for smaller buttons
  fontSize: '0.95rem', // Slightly smaller font size
}));

const ErrorAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

function SurveySubmit({ surveyId, titleProp = '', questions, onSubmitSuccess }: SurveySubmitProps) {
  const [title, setTitle] = useState(titleProp);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false); // State for confirmation dialog

  useEffect(() => {
    if (titleProp) {
      setTitle(titleProp); // Set title to survey title if editing
    }
  }, [titleProp]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please provide a survey title.");
      return;
    }

    setError('');
    setLoading(true);

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
      setError("There was an error submitting the survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler to open confirmation dialog
  const handleOpenConfirm = () => {
    if (questions.length === 0) {
      setError("Please add at least one question to the survey before submitting.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // Handler to close confirmation dialog
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };

  // Handler to confirm submission
  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false);
    handleSubmit();
  };

  return (
    <>
      <StyledBox>
        <StyledTypography variant="h6">
          {surveyId ? "Update Survey" : "Submit Survey"}
        </StyledTypography>

        {error && <ErrorAlert severity="error">{error}</ErrorAlert>}

        <StyledTextField 
          fullWidth
          size="small" // Smaller size for compactness
          label="Survey Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Typography variant="body2" color="textSecondary" mb={0.5}>
          {surveyId ? "Review and update your survey." : "Review your survey before submitting."}
        </Typography>

        <StyledButton 
          variant="contained" 
          color="primary" 
          onClick={handleOpenConfirm} // Open confirmation dialog instead of submitting directly
          disabled={loading}
        >
          {loading ? (surveyId ? "Updating..." : "Submitting...") : (surveyId ? "Update" : "Submit")}
        </StyledButton>
      </StyledBox>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
        fullWidth
        maxWidth="sm"
        aria-labelledby="confirm-survey-submit-title"
        aria-describedby="confirm-survey-submit-description"
      >
        <DialogTitle id="confirm-survey-submit-title">
          {surveyId ? "Confirm Survey Update" : "Confirm Survey Submission"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            {title || "Untitled Survey"}
          </Typography>
          {questions.map((question, index) => (
            <Box key={index} mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {index + 1}. {question.text || `Untitled ${question.type} Question`}
              </Typography>
              {question.type === 'Text Input' && (
                <Typography variant="body2" color="textSecondary">
                  Answer: _______________
                </Typography>
              )}
              {question.type === 'Dropdown' && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Select One:
                  </Typography>
                  <List dense>
                    {question.options.map((option, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemText primary={`- ${option || 'Option'}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {question.type === 'Checkbox' && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Select Multiple:
                  </Typography>
                  <List dense>
                    {question.options.map((option, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemText primary={`- ${option || 'Option'}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary" variant="contained" disabled={loading}>
            {loading ? (surveyId ? "Updating..." : "Submitting...") : (surveyId ? "Update" : "Submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SurveySubmit;
