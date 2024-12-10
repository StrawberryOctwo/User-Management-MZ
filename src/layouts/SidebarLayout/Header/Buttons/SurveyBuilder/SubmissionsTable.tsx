import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import { getSurveyAnswers } from 'src/services/survey';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { debounce } from 'lodash';
import { visuallyHidden } from '@mui/utils';
import { t } from 'i18next';

// Define the Answer interface
interface Answer {
  questionId: number;
  questionText: string;
  answer: { text: string | null; selectedOptions?: string[] } | null;
}

// Define the Submission interface
interface Submission {
  user: { firstName: string; lastName: string; id: number };
  status: string;
  answers: Answer[];
}

// Define the component props
interface SubmissionsTableProps {
  surveyId: number;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  totalSubmissions: number;
  setTotalSubmissions: React.Dispatch<React.SetStateAction<number>>;
  submissionsPage: number;
  setSubmissionsPage: React.Dispatch<React.SetStateAction<number>>;
  submissionsLimit: number;
  setSubmissionsLimit: React.Dispatch<React.SetStateAction<number>>;
  sortStatus: string;
  setSortStatus: React.Dispatch<React.SetStateAction<string>>;
}

function SubmissionsTable({
  surveyId,
  submissions,
  setSubmissions,
  totalSubmissions,
  setTotalSubmissions,
  submissionsPage,
  setSubmissionsPage,
  submissionsLimit,
  setSubmissionsLimit,
  sortStatus,
  setSortStatus,
}: SubmissionsTableProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounced search to optimize API calls
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchTerm(query);
        setSubmissionsPage(1); // Reset to first page on new search
      }, 500),
    [setSearchTerm, setSubmissionsPage]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Fetch submissions data
  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getSurveyAnswers(
          surveyId,
          submissionsPage,
          submissionsLimit,
          sortStatus,
          searchTerm
        );
        setSubmissions(response.submissions);
        setTotalSubmissions(response.totalSubmissions);
      } catch (err) {
        console.error('Failed to load submissions:', err);
        setError('Unable to fetch submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadSubmissions();
  }, [
    surveyId,
    submissionsPage,
    submissionsLimit,
    sortStatus,
    searchTerm,
    setSubmissions,
    setTotalSubmissions,
  ]);

  // Handle opening the answers dialog
  const handleOpenAnswersDialog = (answers: Answer[]) => {
    setSelectedAnswers(answers);
  };

  // Handle closing the answers dialog
  const handleCloseAnswersDialog = () => {
    setSelectedAnswers(null);
  };

  // Determine chip color based on status
  const getStatusChip = (status: string) => {
    let color: 'success' | 'warning' | 'default' | 'error' = 'default';
    switch (status.toLowerCase()) {
      case 'completed':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'skipped':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} variant="outlined" />;
  };

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(event.target.value);
    },
    [debouncedSearch]
  );

  // Memoize table rows to prevent unnecessary re-renders
  const tableRows = useMemo(
    () =>
      submissions.map((submission) => (
        <TableRow key={submission.user.id} hover tabIndex={-1}>
          <TableCell component="th" scope="row">
            {`${submission.user.firstName} ${submission.user.lastName}`}
          </TableCell>
          <TableCell>{getStatusChip(submission.status)}</TableCell>
          <TableCell>
            <Tooltip title="View Answers">
              <IconButton
                onClick={() => handleOpenAnswersDialog(submission.answers)}
                color="primary"
                aria-label={`View answers for ${submission.user.firstName} ${submission.user.lastName}`}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      )),
    [submissions]
  );

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Survey Submissions
      </Typography>

      {/* Search and Filter Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          label={t("search_by_user_name")}
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          InputProps={{
            'aria-label': 'Search by user name',
          }}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel id="sort-status-label">{t("sort_by_status")}</InputLabel>
          <Select
            labelId="sort-status-label"
            label={t("sort_by_status")}
            value={sortStatus}
            onChange={(e) => {
              setSortStatus(e.target.value);
              setSubmissionsPage(1); // Reset to first page on sort change
            }}
            inputProps={{
              'aria-label': 'Sort submissions by status',
            }}
          >
            <MenuItem value="">
              <em>{t("all")}</em>
            </MenuItem>
            <MenuItem value="completed">{t("completed")}</MenuItem>
            <MenuItem value="skipped">{t("skipped")}</MenuItem>
            <MenuItem value="pending">{t("pending")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Error Message */}
      {
        error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )
      }

      {/* Loading Indicator */}
      {
        loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '300px' }}
          >
            <CircularProgress aria-label="Loading submissions" />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table aria-label="Submissions Table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2">User</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{t("status")}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2">{t("actions")}</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length > 0 ? (
                  tableRows
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2">No submissions found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 20]}
                    count={totalSubmissions}
                    rowsPerPage={submissionsLimit}
                    page={submissionsPage - 1}
                    onPageChange={(event, newPage) => setSubmissionsPage(newPage + 1)}
                    onRowsPerPageChange={(event) => {
                      setSubmissionsLimit(parseInt(event.target.value, 10));
                      setSubmissionsPage(1); // Reset to first page on limit change
                    }}
                    labelRowsPerPage="Rows per page"
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'Rows per page',
                      },
                    }}
                    sx={{ '& .MuiTablePagination-toolbar': { flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 } }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )
      }

      {/* Answers Dialog */}
      <Dialog
        open={Boolean(selectedAnswers)}
        onClose={handleCloseAnswersDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="answers-dialog-title"
      >
        <DialogTitle id="answers-dialog-title">User Answers</DialogTitle>
        <DialogContent dividers>
          {selectedAnswers?.length > 0 ? (
            selectedAnswers.map((answer) => (
              <Box key={answer.questionId} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" component="div">
                  {answer.questionText}
                </Typography>
                <Typography variant="body1" component="div" sx={{ pl: 2 }}>
                  {answer.answer
                    ? answer.answer.text ||
                    (answer.answer.selectedOptions &&
                      answer.answer.selectedOptions.join(', ')) ||
                    'No answer provided.'
                    : 'No answer provided.'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No answers available.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box >
  );
}

export default SubmissionsTable;
