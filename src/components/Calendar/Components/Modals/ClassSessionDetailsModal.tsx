import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import moment from 'moment';
import {
  fetchClassSessionById,
  getClassSessionReportsStatus,
  getStudentSessionReportStatus
} from 'src/services/classSessionService';
import AddSessionReportForm from './AddSessionReportForm';
import ViewSessionReportForm from './ViewSessionReport';
import StudentDetailCard from './StudentDetailCArd';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import AbsenceTab from './AbsenceTab';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { calculateEndTimeInMinutes } from 'src/utils/teacherUtils';

interface ClassSessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onEdit: () => void;
  onDelete: () => void;
  onDeactivate: (appointmentId: any, newStatus: any) => void;
  canEdit: boolean;
  canAddReport: boolean;
  onDeactivateComplete: () => void; // New prop
}

const ClassSessionDetailsModal: React.FC<ClassSessionDetailsModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  onEdit,
  onDelete,
  onDeactivate,
  onDeactivateComplete,
  canEdit,
  canAddReport
}) => {
  const [classSession, setClassSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<{
    [studentId: string]: { reportCompleted: boolean; reportId: string | null };
  }>({});
  let [allReportsCompleted, setAllReportsCompleted] = useState<boolean>(false);
  const [isReportFormOpen, setReportFormOpen] = useState<boolean>(false);
  const [isViewReportFormOpen, setViewReportFormOpen] =
    useState<boolean>(false);
  const [isViewPaymentModalOpen, setViewPaymentModalOpen] =
    useState<boolean>(false);
  const [isAbsenceModalOpen, setAbsenceModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Fetch class session details
  const loadClassSession = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchClassSessionById(appointmentId);
      setClassSession(response);

      const reportResponse = await getClassSessionReportsStatus(appointmentId);
      setAllReportsCompleted(reportResponse.allReportsCompleted);

      const studentReportsStatus: {
        [studentId: string]: {
          reportCompleted: boolean;
          reportId: string | null;
        };
      } = {};
      for (const student of response.students) {
        const studentReport = await getStudentSessionReportStatus(
          appointmentId,
          student.id
        );
        studentReportsStatus[student.id] = {
          reportCompleted: studentReport.reportCompleted,
          reportId: studentReport.reportId
        };
      }

      setReportStatus(studentReportsStatus);
    } catch (error) {
      setErrorMessage('Failed to load class session details.');
      console.error('Error fetching class session details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadClassSession();
    }
  }, [isOpen, appointmentId]);

  useEffect(() => {
    if (allReportsCompleted) {
    }
  }, [allReportsCompleted]);

  const handleAddReport = (student: any) => {
    setSelectedStudent(student);
    setReportFormOpen(true);
  };

  const handleViewReport = (student: any) => {
    const reportData = reportStatus[student.id];
    if (reportData && reportData.reportId) {
      setSelectedStudent(student);
      setSelectedReportId(reportData.reportId);
      setViewReportFormOpen(true);
    } else {
      console.log('No report available for this student');
    }
  };

  const handleViewPayment = (student: any) => {
    setSelectedStudent(student);
    setViewPaymentModalOpen(true);
  };

  const handleAbsence = (student: any) => {
    setSelectedStudent(student);
    setAbsenceModalOpen(true);
  };

  const refreshClassSessionData = async () => {
    setLoading(true);
    try {
      await loadClassSession(); // Reload the session data
    } catch (error) {
      console.error('Error refreshing class session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (newReport: any) => {
    refreshClassSessionData();
    setReportFormOpen(false);
  };

  const handleCloseReportForm = () => {
    setViewReportFormOpen(false);
    refreshClassSessionData();
  };

  const handleCloseAbsenceModel = async () => {
    setAbsenceModalOpen(false);
    setSelectedStudent(null);
    await refreshClassSessionData();
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(true);
  };

  const handleDeactivate = async () => {
    setDeactivateDialogOpen(true);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleToggleActivation = async () => {
    const newStatus = !classSession.isActive;
    await onDeactivate(appointmentId, newStatus); // Toggle activation status
    setDeactivateDialogOpen(false);
    onDeactivateComplete(); // Refresh sessions in parent component
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      sx={{ '& .MuiDialog-paper': { width: '750px', maxWidth: '750px' } }} // Set the custom width
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Class Session Details</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit && (
            <>
              <IconButton
                onClick={onEdit}
                color="primary"
                sx={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '50%',
                  '&:hover': { backgroundColor: '#e0e0e0' }
                }}
              >
                <EditIcon />
              </IconButton>
              <RoleBasedComponent
                allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher']}
              >
                <IconButton
                  onClick={() => setDeactivateDialogOpen(true)}
                  color={classSession?.isActive ? 'warning' : 'success'}
                  sx={{
                    backgroundColor: '#f0f0f0',
                    borderRadius: '50%',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  {classSession?.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </RoleBasedComponent>
            </>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minHeight: '370px' }} className="djfhjdf">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Session Details" />
          <Tab label="Students Enrolled" />
        </Tabs>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : errorMessage ? (
          <Typography color="error">{errorMessage}</Typography>
        ) : classSession ? (
          <Box sx={{ px: 1 }}>
            {tabIndex === 0 && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>Session Name:</strong> {classSession.classSession.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Teacher:</strong>{' '}
                    {classSession.teacher?.user?.firstName}{' '}
                    {classSession.teacher?.user?.lastName}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Topic:</strong> {classSession.classSession.topic?.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Location:</strong> {classSession.location.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Session Type:</strong>{' '}
                    {classSession?.classSession?.sessionType?.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Start Time:</strong>{' '}
                    {classSession.startTime.slice(0, 5)}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>End Time:</strong>{' '}
                    {calculateEndTimeInMinutes(classSession.startTime, classSession.duration)}
                  </Typography>
                </CardContent>
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>Notes:</strong>
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      maxHeight: '9em', // Limit height to approximately 3 lines (1.5em per line)
                      overflowY: 'auto', // Enable vertical scrolling
                      wordBreak: 'break-word', // Break long words
                      scrollbarWidth: 'thin', // Thin scrollbar for Firefox
                      '&::-webkit-scrollbar': {
                        width: '6px' // Thin scrollbar for WebKit browsers
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Scrollbar thumb color
                        borderRadius: '3px' // Rounded scrollbar thumb
                      }
                    }}
                  >
                    {classSession.note}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {tabIndex === 1 && (
              <>
                {classSession.students?.length > 0 ? (
                  classSession.students.map((student: any) => (
                    <StudentDetailCard
                      key={student.id}
                      student={student}
                      canAddReport={canAddReport}
                      classSessionId={classSession.id}
                      reportCompleted={
                        reportStatus[student.id]?.reportCompleted
                      }
                      onAddReport={() => handleAddReport(student)}
                      onViewReport={() => handleViewReport(student)}
                      onViewPayment={() => handleViewPayment(student)}
                      handleAbsence={() => handleAbsence(student)}
                    />
                  ))
                ) : (
                  <Typography variant="body2">No students enrolled.</Typography>
                )}

                {allReportsCompleted && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mt={3}
                  >
                    <Typography
                      variant="h5"
                      color="green"
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        backgroundColor: '#e0f2f1',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid green'
                      }}
                    >
                      Session Reports Submitted
                    </Typography>
                  </Box>
                )}

                {/* Add Session Report Form Dialog */}
                <AddSessionReportForm
                  isOpen={isReportFormOpen}
                  onClose={() => setReportFormOpen(false)}
                  onSave={handleSaveReport}
                  studentName={
                    selectedStudent
                      ? `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}`
                      : ''
                  }
                  classSessionId={appointmentId}
                  studentId={selectedStudent ? selectedStudent.id : ''}
                  userId={selectedStudent ? selectedStudent.user.id : ''}
                />

                {/* View Session Report Form Dialog */}
                {selectedStudent && selectedReportId && (
                  <ViewSessionReportForm
                    isOpen={isViewReportFormOpen}
                    onClose={handleCloseReportForm}
                    reportId={selectedReportId}
                    onDelete={handleCloseReportForm}
                  />
                )}

                {selectedStudent && (
                  <AbsenceTab
                    classSessionId={classSession.id}
                    isOpen={isAbsenceModalOpen}
                    student={selectedStudent}
                    onClose={() => {
                      handleCloseAbsenceModel();
                    }}
                  />
                )}
              </>
            )}
          </Box>
        ) : (
          <Typography>No class session details available.</Typography>
        )}
      </DialogContent>
      {/* <DialogActions sx={{ marginBottom: 2 }}>
        <Box sx={{ paddingRight: 2 }}>
          {canEdit && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={onEdit}
                color="primary"
                variant="outlined"
                style={{ padding: '8px 16px' }}
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px'
                }}
                color="error"
                variant="outlined"
              >
                Delete
              </Button>
              <RoleBasedComponent
                allowedRoles={['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher']}>
                <Button
                  onClick={() => setDeactivateDialogOpen(true)}
                  color="warning"
                  variant="outlined"
                >
                  {classSession?.isActive ? 'Deactivate' : 'Reactivate'}
                </Button>
              </RoleBasedComponent>
            </Box>
          )}
        </Box>
      </DialogActions> */}

      <ReusableDialog
        open={deleteDialogOpen}
        title="Confirm Deletion"
        onClose={() => setDeleteDialogOpen(false)}
        actions={
          <>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              color="inherit"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the class session?</p>
      </ReusableDialog>
      <ReusableDialog
        open={deactivateDialogOpen}
        title={`Confirm ${classSession?.isActive ? 'Deactivation' : 'Reactivation'
          }`}
        onClose={() => setDeactivateDialogOpen(false)}
        actions={
          <>
            <Button
              onClick={() => setDeactivateDialogOpen(false)}
              color="inherit"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleActivation}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to{' '}
          {classSession?.isActive ? 'deactivate' : 'reactivate'} the class
          session?
        </p>
      </ReusableDialog>
    </Dialog>
  );
};

export default ClassSessionDetailsModal;
