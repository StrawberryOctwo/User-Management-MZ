import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
  Dialog,
  Badge,
  Button,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { getSurveysForSelf } from 'src/services/survey';
import SurveySubmitDialog from './SurveySubmitDialog';

function SurveyNotifications() {
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  // Fetch surveys when component mounts
  useEffect(() => {
    fetchSurveys(1);
  }, []);

  const fetchSurveys = async (pageNumber) => {
    try {
      const data = await getSurveysForSelf(pageNumber, limit);
      setSurveys((prevSurveys) => (pageNumber === 1 ? data.data : [...prevSurveys, ...data.data]));
      setPage(pageNumber);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSurveyClick = (survey) => {
    if (survey.status === 'pending') {
      setSelectedSurvey(survey);
    }
  };

  const handleSurveySubmit = async () => {
    await fetchSurveys(page); // Refresh survey list
    setSelectedSurvey(null); // Close dialog after submission
  };

  const pendingCount = surveys.filter((survey) => survey.status === 'pending').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'error.main';
      case 'completed':
        return 'success.main';
      case 'skipped':
        return 'text.secondary';
      default:
        return 'text.secondary';
    }
  };

  return (
    <>
      <Tooltip arrow title="Surveys">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <Badge badgeContent={pendingCount} color="error">
            <FeedbackIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 2 }} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">Your Surveys</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {surveys.map((survey) => (
            <ListItem
              key={survey.id}
              sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: survey.status === 'pending' ? 'pointer' : 'default' }}
              onClick={() => handleSurveyClick(survey)}
            >
              <Box flex="1">
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {survey.survey.title}
                </Typography>
                <Typography variant="body2" color={getStatusColor(survey.status)} sx={{ mt: 0.5 }}>
                  {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Assigned: {new Date(survey.survey.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
        {surveys.length >= limit * page && (
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Button onClick={() => fetchSurveys(page + 1)} color="primary">
              See More
            </Button>
          </Box>
        )}
      </Dialog>

      {/* Dialog for submitting survey */}
      {selectedSurvey && (
        <SurveySubmitDialog
          surveyId={selectedSurvey.survey.id}
          onClose={() => setSelectedSurvey(null)}
          onSubmitSuccess={handleSurveySubmit}
        />
      )}
    </>
  );
}

export default SurveyNotifications;
