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
  CircularProgress,
  Pagination,
  Alert,
} from '@mui/material';
import PollIcon from '@mui/icons-material/Poll';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { getSurveysForSelf } from 'src/services/survey';
import SurveySubmitDialog from './SurveySubmitDialog';
import { styled, alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Define possible survey statuses
const SURVEY_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};

// Status Icons and Colors Mapping


// Styled Badge to show pending survey count
const PendingBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: alpha(theme.palette.error.main, 0.1), // Light background
    color: theme.palette.error.main, // Text color
    minWidth: '18px',
    height: '18px',
    borderRadius: '50%',
    padding: '0 4px',
    fontSize: '0.75rem',
    boxShadow: `0 0 0 1px ${alpha(theme.palette.error.main, 0.3)}`,
  },
}));

function SurveyNotifications() {
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [pageCount, setPageCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); 

  const statusConfig = {
    [SURVEY_STATUSES.PENDING]: {
      icon: <PollIcon fontSize="small" color="error" />,
      color: 'error.main',
      label: t("pending"),
    },
    [SURVEY_STATUSES.COMPLETED]: {
      icon: <CheckCircleIcon fontSize="small" color="success" />,
      color: 'success.main',
      label: t("completed"),
    },
    [SURVEY_STATUSES.SKIPPED]: {
      icon: <SkipNextIcon fontSize="small" color="warning" />,
      color: 'warning.main',
      label: t("skipped"),
    },
  };
  useEffect(() => {
    fetchSurveys(1);
  }, []);

  const fetchSurveys = async (pageNumber) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSurveysForSelf(pageNumber, limit);
      setSurveys(data.data);
      setPage(data.page); // Current page from API
      setPageCount(data.pageCount); // Total pages from API
      setTotal(data.total); // Total items from API
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      setError('Unable to fetch surveys. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSurveyClick = (survey) => {
    if (survey.status === SURVEY_STATUSES.PENDING) {
      setSelectedSurvey(survey);
    }
  };

  const handleSurveySubmit = async () => {
    await fetchSurveys(page);
    setSelectedSurvey(null);
  };

  // Count pending surveys for the badge
  const pendingCount = surveys.filter((survey) => survey.status === SURVEY_STATUSES.PENDING).length;

  return (
    <>
      <Tooltip arrow title="Surveys">
        <IconButton
          color="primary"
          ref={ref}
          onClick={handleOpen}
          aria-label="open surveys"
        >
          <PendingBadge badgeContent={pendingCount} invisible={pendingCount === 0}>
            <PollIcon />
          </PendingBadge>
        </IconButton>
      </Tooltip>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        {/* Dialog Header */}
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Your Surveys
          </Typography>
          <IconButton onClick={handleClose} aria-label="close dialog" sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {/* Dialog Content */}
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : surveys.length === 0 ? (
            <Typography variant="body1" align="center" color="textSecondary">
              No surveys available.
            </Typography>
          ) : (
            <>
              <List>
                {surveys.map((survey) => (
                  <ListItem
                    key={survey.id}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      cursor: survey.status === SURVEY_STATUSES.PENDING ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor:
                          survey.status === SURVEY_STATUSES.PENDING
                            ? alpha('#1976d2', 0.04)
                            : 'inherit',
                      },
                      borderLeft: `4px solid ${statusConfig[survey.status].color}`,
                      backgroundColor: 'primary', // Optional: Light background
                      borderRadius: '4px',
                      mb: 1,
                    }}
                    onClick={() => handleSurveyClick(survey)}
                    aria-label={`survey ${survey.survey.title}`}
                  >
                    <Box flex="1">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {survey.survey.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {/* Status Icon */}
                        {statusConfig[survey.status].icon}
                        <Typography
                          variant="body2"
                          color={survey.status === SURVEY_STATUSES.PENDING ? 'error.main' : 'text.secondary'}
                          sx={{ ml: 0.5 }}
                        >
                          {statusConfig[survey.status].label}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                        Assigned: {new Date(survey.survey.createdAt).toLocaleDateString('de')}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              {/* Pagination Controls */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Page {page} of {pageCount}
                </Typography>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(event, value) => fetchSurveys(value)}
                  color="primary"
                  size="small"
                  siblingCount={1}
                  boundaryCount={1}
                  showFirstButton
                  showLastButton
                />
              </Box>
              {/* Total Surveys */}
              <Typography
                variant="caption"
                color="textSecondary"
                align="right"
                display="block"
                mt={1}
              >
                Total Surveys: {total}
              </Typography>
            </>
          )}
        </Box>
      </Dialog>

      {/* Survey Submit Dialog */}
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
