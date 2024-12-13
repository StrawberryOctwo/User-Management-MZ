import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Checkbox,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { fetchSurveyById, skipSurveyForSelf, submitSurveyForSelf } from 'src/services/survey';
import { t } from "i18next"

interface SurveySubmitDialogProps {
  surveyId: number;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

function SurveySubmitDialog({ surveyId, onClose, onSubmitSuccess }: SurveySubmitDialogProps) {
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: { text?: string; selectedOptions?: string[] } }>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetchSurveyById(surveyId);
        setSurvey(response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching survey:", err);
        setError('Failed to load survey');
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [surveyId]);
  const handleSkip = async () => {
    try {
      await skipSurveyForSelf(surveyId);
      onSubmitSuccess(); // Refresh survey list in parent component
      onClose(); // Close the dialog
    } catch (error) {
      console.error('Error skipping survey:', error);
    }
  };
  const handleChange = (questionId: number, value: string | string[], type: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: type === 'Checkbox'
        ? { selectedOptions: value as string[] }
        : { text: value as string }
    }));
  };

  const handleSubmit = async () => {
    const answerArray = survey.questions.map((question) => ({
      questionId: question.id,
      question: question.text,
      text: question.type === 'Text Input' || question.type === 'Dropdown' ? answers[question.id]?.text || '' : null,
      selectedOptions: question.type === 'Checkbox' ? answers[question.id]?.selectedOptions || [] : null,
    }));

    try {
      await submitSurveyForSelf(surveyId, answerArray);
      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onClose={onClose}>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  if (error || !survey) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogTitle>{t("error")}</DialogTitle>
        <DialogContent>
          <Typography color="error">{error || 'Survey not found'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <Box display="flex" flexDirection="column" p={2} sx={{ gap: 2 }}>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.75rem' }}>{survey.title}</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {survey.questions?.map((question) => (
            <Box key={question.id} p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                {question.text}
              </Typography>
              {question.type === 'Text Input' && (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={answers[question.id]?.text || ''}
                  onChange={(e) => handleChange(question.id, e.target.value, 'Text Input')}
                  placeholder="Enter your answer here"
                />
              )}
              {question.type === 'Checkbox' && (
                <Box display="flex" flexDirection="column">
                  {question.options.map((option, idx) => (
                    <Box key={idx} display="flex" alignItems="center" sx={{ gap: 1 }}>
                      <Checkbox
                        checked={answers[question.id]?.selectedOptions?.includes(option) || false}
                        onChange={(e) =>
                          handleChange(
                            question.id,
                            e.target.checked
                              ? [...(answers[question.id]?.selectedOptions || []), option]
                              : answers[question.id]?.selectedOptions?.filter((opt) => opt !== option) || [],
                            'Checkbox'
                          )
                        }
                      />
                      <Typography>{option}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {question.type === 'Dropdown' && (
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  value={answers[question.id]?.text || ''}
                  onChange={(e) => handleChange(question.id, e.target.value, 'Dropdown')}
                >
                  {question.options.map((option, idx) => (
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
          ))}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button onClick={handleSkip} color="secondary" variant="outlined">
            Skip Survey
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit Survey
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default SurveySubmitDialog;
