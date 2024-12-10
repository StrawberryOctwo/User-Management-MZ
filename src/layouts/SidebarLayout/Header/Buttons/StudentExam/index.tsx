// components/StudentExamsHeader.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Tooltip,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { fetchExamsForSelf, addExamForSelf } from 'src/services/studentExamService';
import { t } from "i18next"

const StudentExamsHeader: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamGrade, setNewExamGrade] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const limit = 5; // Set pagination limit to 5 items per page

  useEffect(() => {
    loadExams(page);
  }, [page]);

  const loadExams = async (pageNumber: number) => {
    try {
      const { data, total, pageCount } = await fetchExamsForSelf(pageNumber, limit);
      setExams(data);
      setTotalPages(pageCount);
    } catch (error) {
      console.error('Failed to load exams:', error);
      setErrorMessage('Failed to load exams');
    }
  };

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewExamName('');
    setNewExamGrade('');
    setErrorMessage(null);
  };

  const handleAddExam = async () => {
    if (!newExamName || !newExamGrade) {
      setErrorMessage('Exam name and grade are required.');
      return;
    }

    try {
      await addExamForSelf({ examName: newExamName, grade: newExamGrade });
      handleCloseDialog();
      loadExams(page); // Refresh exams list
    } catch (error) {
      console.error('Failed to add exam:', error);
      setErrorMessage('Failed to add exam');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip arrow title="View Exams">
        <IconButton color="primary" onClick={handleOpenDialog}>
          <SchoolIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{t("(my_exams")}</DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          {/* Exams List */}
          <Paper elevation={3} sx={{ mb: 2 }}>
            <List>
              {exams.map((exam) => (
                <ListItem key={exam.id} divider>
                  <ListItemText
                    primary={<Typography variant="body1" fontWeight="bold">{exam.name}</Typography>}
                    secondary={`Grade: ${exam.grade}`}
                  />
                </ListItem>
              ))}
              {exams.length === 0 && (
                <Box p={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t("(no_exams_found.")}
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>


          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Add Exam Form */}
          <Typography variant="h6" align="center" gutterBottom>
            {t("(add_new_exam")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Exam Name"
                variant="outlined"
                fullWidth
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Grade"
                variant="outlined"
                fullWidth
                value={newExamGrade}
                onChange={(e) => setNewExamGrade(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            {t("(cancel")}
          </Button>
          <Button onClick={handleAddExam} color="primary" variant="contained">
            {t("(save_exam")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentExamsHeader;
