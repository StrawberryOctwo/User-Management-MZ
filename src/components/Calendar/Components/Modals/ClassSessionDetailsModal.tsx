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
  getStudentSessionReportStatus,
  submitTeacherReports // Added import
} from 'src/services/classSessionService';
import AddSessionReportForm from './AddSessionReportForm';
import ViewSessionReportForm from './ViewSessionReport';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import AbsenceTab from './AbsenceTab';
import RoleBasedComponent from 'src/components/ProtectedComponent';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { calculateEndTimeInMinutes } from 'src/utils/teacherUtils';
import StudentDetailCard from './StudentDetailCArd';
import ConfirmationDialog from './ConfirmationDialog';
import { useTranslation } from 'react-i18next';


interface ClassSessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onEdit: (classSession: any) => void;
  onDelete: () => void;
  onDeactivate: (appointmentId: any, newStatus: any) => void;
  canEdit: boolean;
  canAddReport: boolean;
  canReactivate: boolean;
  onDeactivateComplete: () => void;
  sessionEnded: boolean;
  setIsSessionEnded: (sessionEnded: boolean) => void;
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
  canReactivate,
  canAddReport,
  sessionEnded,
  setIsSessionEnded
}) => {
  const { t } = useTranslation(); 
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

  // New state variables for submission
  const [isSubmittingReports, setIsSubmittingReports] =
    useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch class session details
  const loadClassSession = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchClassSessionById(appointmentId);
      setClassSession(response);

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

      // Check if all reports are completed
      // const allCompleted = response.students.every(
      //   (student: any) => studentReportsStatus[student.id].reportCompleted
      // );

      // Check if all reports are submitted
      const allCompleted = response.reportsSubmitted;

      // console.log()
      setAllReportsCompleted(allCompleted);
      setSubmissionSuccess(allCompleted);
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
      await loadClassSession();
    } catch (error) {
      console.error('Error refreshing class session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (newReport: any) => {
    await refreshClassSessionData();
    setReportFormOpen(false);
  };

  const handleCloseReportForm = () => {
    setViewReportFormOpen(false);
  };

  const handleDeleteReportForm = () => {
    setViewReportFormOpen(false);
    refreshClassSessionData();
  };

  const handleCloseAbsenceModel = async () => {
    setAbsenceModalOpen(false);
    setSelectedStudent(null);
    await refreshClassSessionData();
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleToggleActivation = async () => {
    const newStatus = !classSession.isActive;
    await onDeactivate(appointmentId, newStatus);
    setDeactivateDialogOpen(false);
    onDeactivateComplete(); // Refresh sessions in parent component
  };

  const handleEdit = () => {
    if (classSession) {
      onEdit(classSession);
    }
  };

  useEffect(() => {
    if (classSession) {
      const endTime = moment(classSession.startTime, 'HH:mm:ss')
        .add(classSession.duration, 'minutes')
        .format('HH:mm:ss');
      const endDateTime = moment(
        `${classSession.date} ${endTime}`,
        'YYYY-MM-DD HH:mm:ss'
      );
      const currentDateTime = moment();

      if (currentDateTime.isAfter(endDateTime)) {
        setIsSessionEnded(true);
      } else {
        setIsSessionEnded(false);
      }
    }
  }, [classSession]);

  // New handler for submitting all reports
  const handleSubmitAllReports = async () => {
    if (!classSession) return;

    setIsSubmittingReports(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      await submitTeacherReports({ classSessionId: classSession.id });
      setSubmissionSuccess(true);
      // Refresh the class session data to update the `reportsSubmitted` status
      await loadClassSession();
    } catch (error) {
      console.error('Error submitting reports:', error);
    } finally {
      setIsSubmittingReports(false);
    }
  };

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  console.log('isSubmittingReports', isSubmittingReports);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      sx={{ '& .MuiDialog-paper': { width: '750px', maxWidth: '750px' } }} // Set the custom width
    >
      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={() => {
          handleSubmitAllReports();
          handleCloseConfirm();
        }}
        title="Confirm Report Submission"
        content="Are you sure you want to submit all the session reports?"
        confirmButtonColor="error"
      />
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">{t("class_session_details")}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit && (
            <IconButton
              onClick={handleEdit}
              color="primary"
              sx={{
                backgroundColor: '#f0f0f0',
                borderRadius: '50%',
                '&:hover': { backgroundColor: '#e0e0e0' }
              }}
            >
              <EditIcon />
            </IconButton>
          )}
          <RoleBasedComponent
            allowedRoles={[
              'SuperAdmin',
              'FranchiseAdmin',
              'LocationAdmin',
              'Teacher'
            ]}
          >
            {classSession?.isActive && !sessionEnded ? (
              <IconButton
                onClick={() => setDeactivateDialogOpen(true)}
                color="warning"
                sx={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '50%',
                  '&:hover': { backgroundColor: '#e0e0e0' }
                }}
              >
                <VisibilityOffIcon />
              </IconButton>
            ) : (
              !classSession?.isActive &&
              canReactivate && (
                <IconButton
                  onClick={() => setDeactivateDialogOpen(true)}
                  color="success"
                  sx={{
                    backgroundColor: '#f0f0f0',
                    borderRadius: '50%',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              )
            )}
          </RoleBasedComponent>
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
                    <strong>{t("session_name")}:</strong>{' '}
                    {classSession.classSession.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("teacher")}:</strong>{' '}
                    {classSession.teacher?.user?.firstName}{' '}
                    {classSession.teacher?.user?.lastName}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("topic")}:</strong>{' '}
                    {classSession.classSession.topic?.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("location")}:</strong> {classSession.location.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("session_type")}:</strong>{' '}
                    {classSession?.sessionType?.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("start_time")}:</strong>{' '}
                    {classSession.startTime.slice(0, 5)}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("end_time")}:</strong>{' '}
                    {calculateEndTimeInMinutes(
                      classSession.startTime,
                      classSession.duration
                    )}
                  </Typography>
                </CardContent>
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>{t("notes")}:</strong>
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
                    {classSession.note || t('no_notes_available.')}
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
                  <Typography variant="body2">{t("class_session_details")}No students enrolled.</Typography>
                )}

                {/* Display success or error messages */}
                {submissionSuccess && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 2 }}
                  >
                    {submissionSuccess &&
                      t('all_session_reports_have_been_successfully_submitted.')}
                  </Typography>
                )}
                {submissionError && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    {submissionError}
                  </Typography>
                )}

                {/* Submit All Reports Button */}
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenConfirm}
                    disabled={
                      classSession.reportsSubmitted || isSubmittingReports
                    }
                    startIcon={
                      isSubmittingReports && <CircularProgress size={20} />
                    }
                  >
                    {t("aubmit_all_reports")}
                  </Button>
                </Box>

                {/* Add Session Report Form Dialog */}
                <AddSessionReportForm
                  isOpen={isReportFormOpen}
                  onClose={async () => {
                    await refreshClassSessionData();
                    setReportFormOpen(false);
                  }}
                  onSave={handleSaveReport}
                  studentName={
                    selectedStudent
                      ? `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}`
                      : ''
                  }
                  classSessionId={appointmentId}
                  studentId={selectedStudent ? selectedStudent.id : ''}
                  user={selectedStudent}
                  teacher={classSession.teacher}
                  sessionDate={classSession.date}
                />

                {/* View Session Report Form Dialog */}
                {selectedStudent && selectedReportId && (
                  <ViewSessionReportForm
                    isOpen={isViewReportFormOpen}
                    onClose={handleCloseReportForm}
                    reportId={selectedReportId}
                    onDelete={handleDeleteReportForm}
                    isEditable={!allReportsCompleted}
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
          <Typography>{t("no_class_session_details_available.")}</Typography>
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
                {t("delete")}
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
        title={t("confirm_deletion")}
        onClose={() => setDeleteDialogOpen(false)}
        actions={
          <>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              color="inherit"
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={onDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>{t("are_you_sure_you_want_to_delete_the_class_session?")}</p>
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
              {t("cancel")}{t("(cancel")}
            </Button>
            <Button
              onClick={handleToggleActivation}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>
          {t("are_you_sure_you_want_to")}{' '}
          {classSession?.isActive ? 'deactivate' : 'reactivate'} the class
          session?
        </p>
      </ReusableDialog>
    </Dialog>
  );
};

export default ClassSessionDetailsModal;
