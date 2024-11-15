import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { getSurveyAnswers } from 'src/services/survey';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Answer {
  questionId: number;
  questionText: string;
  answer: { text: string | null; selectedOptions?: string[] } | null;
}

interface Submission {
  user: { firstName: string; lastName: string; id: number };
  status: string;
  answers: Answer[];
}

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

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
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
      } catch (error) {
        console.error("Failed to load submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSubmissions();
  }, [surveyId, submissionsPage, submissionsLimit, sortStatus, searchTerm]);

  const handleOpenAnswersDialog = (answers: Answer[]) => {
    setSelectedAnswers(answers);
  };

  const handleCloseAnswersDialog = () => {
    setSelectedAnswers(null);
  };

  const getStatusChip = (status: string) => {
    const color = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'default';
    return <Chip label={status} color={color} variant="outlined" />;
  };

  return (
    <div>
      <TextField
        label="Search by User Name"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sort By Status</InputLabel>
        <Select value={sortStatus} onChange={(e) => setSortStatus(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="skipped">Skipped</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </Select>
      </FormControl>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Answers</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.user.id}>
                  <TableCell>{`${submission.user.firstName} ${submission.user.lastName}`}</TableCell>
                  <TableCell>{getStatusChip(submission.status)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenAnswersDialog(submission.answers)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 20]}
                  count={totalSubmissions}
                  rowsPerPage={submissionsLimit}
                  page={submissionsPage - 1}
                  onPageChange={(event, newPage) => setSubmissionsPage(newPage + 1)}
                  onRowsPerPageChange={(event) => setSubmissionsLimit(parseInt(event.target.value, 10))}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}

      {/* Answers Dialog */}
      {selectedAnswers && (
        <Dialog open={Boolean(selectedAnswers)} onClose={handleCloseAnswersDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Answers</DialogTitle>
          <DialogContent>
            {selectedAnswers.map((answer) => (
              <Typography key={answer.questionId} variant="body2" sx={{ mb: 1 }}>
                <strong>{answer.questionText}:</strong>{" "}
                {answer.answer
                  ? answer.answer.text || (answer.answer.selectedOptions && answer.answer.selectedOptions.join(', '))
                  : "No answer"}
              </Typography>
            ))}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default SubmissionsTable;
