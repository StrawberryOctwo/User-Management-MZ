import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  TableFooter,
  TablePagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import SurveyBuilderDialog from './SurveyBuilderDialog';
import SubmissionsTable from './SubmissionsTable';
import { fetchSurveyById, fetchAllSurveys } from 'src/services/survey';
import moment from 'moment';

function ViewSurveysTable() {
  const [surveys, setSurveys] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSubmissionsDialog, setOpenSubmissionsDialog] = useState(false);
  const [openSurveyListDialog, setOpenSurveyListDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsLimit, setSubmissionsLimit] = useState(10);
  const [sortStatus, setSortStatus] = useState('');

  const loadSurveys = async () => {
    try {
      const response = await fetchAllSurveys(page, rowsPerPage);
      setSurveys(response.data);
    } catch (error) {
      console.error("Failed to load surveys:", error);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, [page, rowsPerPage]);

  const handleEdit = async (surveyId) => {
    try {
      const fullSurveyData = await fetchSurveyById(surveyId);
      setSelectedSurvey(fullSurveyData);
      setOpenEditDialog(true);
    } catch (error) {
      console.error("Failed to fetch survey details:", error);
    }
  };

  const handleViewSubmissions = (survey) => {
    setSelectedSurvey(survey);
    setOpenSubmissionsDialog(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedSurvey(null);
    setOpenEditDialog(false);
    loadSurveys(); // Reload the surveys list after closing the edit dialog
  };

  const handleCloseSubmissionsDialog = () => {
    setOpenSubmissionsDialog(false);
  };

  const handleCloseSurveyListDialog = () => {
    setOpenSurveyListDialog(false);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(1);
  };

  return (
    <div>
      <IconButton color="primary" onClick={() => setOpenSurveyListDialog(true)}>
        <ListIcon />
      </IconButton>

      <Dialog open={openSurveyListDialog} onClose={handleCloseSurveyListDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                  <TableCell><strong>Updated At</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>{survey.title}</TableCell>
                    <TableCell>{moment(survey.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>{moment(survey.updatedAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleViewSubmissions(survey)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleEdit(survey.id)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 20]}
                    count={surveys.length * page}
                    rowsPerPage={rowsPerPage}
                    page={page - 1}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {selectedSurvey && (
        <Dialog open={openSubmissionsDialog} onClose={handleCloseSubmissionsDialog} maxWidth="md" fullWidth>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              Submissions for Survey: {selectedSurvey.title}
            </Typography>
            <SubmissionsTable
              surveyId={selectedSurvey.id}
              submissions={submissions}
              setSubmissions={setSubmissions}
              totalSubmissions={totalSubmissions}
              setTotalSubmissions={setTotalSubmissions}
              submissionsPage={submissionsPage}
              setSubmissionsPage={setSubmissionsPage}
              submissionsLimit={submissionsLimit}
              setSubmissionsLimit={setSubmissionsLimit}
              sortStatus={sortStatus}
              setSortStatus={setSortStatus}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedSurvey && (
        <SurveyBuilderDialog
          open={openEditDialog}
          survey={selectedSurvey}
          onClose={handleCloseEditDialog}
        />
      )}
    </div>
  );
}

export default ViewSurveysTable;
