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

import { styled, alpha } from '@mui/material/styles';

// Styled Badge to match the previous color
const CustomBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: alpha(theme.palette.error.main, 0.1), // Match background color
    color: theme.palette.error.main, // Match text color
    minWidth: '16px',
    height: '16px',
    borderRadius: '50%',
    padding: 0,
    boxShadow: `0 0 0 1px ${alpha(theme.palette.error.main, 0.3)}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      boxShadow: `0 0 0 1px ${alpha(theme.palette.error.main, 0.3)}`,
      content: '""',
    },
  },
}));

function SurveyNotifications() {
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchSurveys(1);
  }, []);

  const fetchSurveys = async (pageNumber) => {
    try {
      const data = await getSurveysForSelf(pageNumber, limit);
      setSurveys((prevSurveys) =>
        pageNumber === 1 ? data.data : [...prevSurveys, ...data.data]
      );
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
    await fetchSurveys(page);
    setSelectedSurvey(null);
  };

  const pendingCount = surveys.filter((survey) => survey.status === 'pending').length;

  return (
    <>
      <Tooltip arrow title="Surveys">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <CustomBadge badgeContent={pendingCount}>
            <FeedbackIcon />
          </CustomBadge>
        </IconButton>
      </Tooltip>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 2 }} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            Your Surveys
          </Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {surveys.map((survey) => (
            <ListItem
              key={survey.id}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                cursor: survey.status === 'pending' ? 'pointer' : 'default',
              }}
              onClick={() => handleSurveyClick(survey)}
            >
              <Box flex="1">
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {survey.survey.title}
                </Typography>
                <Typography
                  variant="body2"
                  color={survey.status === 'pending' ? 'error.main' : 'text.secondary'}
                  sx={{ mt: 0.5 }}
                >
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

