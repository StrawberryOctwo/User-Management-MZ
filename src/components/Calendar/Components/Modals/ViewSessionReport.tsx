import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  getSessionReportById,
  updateSessionReport,
  deleteSessionReport
} from 'src/services/sessionReportService';
import { format } from 'date-fns';
import { t } from 'i18next';

interface ViewSessionReportFormProps {
  isOpen: boolean;
  reportId: string;
  onClose: () => void;
  onDelete: () => void;
  isEditable?: boolean;
}

const ViewSessionReportForm: React.FC<ViewSessionReportFormProps> = ({
  isOpen,
  onClose,
  reportId,
  onDelete,
  isEditable = false
}) => {
  const [lessonTopic, setLessonTopic] = useState<string>('');
  const [coveredMaterials, setCoveredMaterials] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [learningAssessment, setLearningAssessment] = useState<string>('');
  const [activeParticipation, setActiveParticipation] =
    useState<boolean>(false);
  const [concentration, setConcentration] = useState<boolean>(false);
  const [worksIndependently, setWorksIndependently] = useState<boolean>(false);
  const [cooperation, setCooperation] = useState<boolean>(false);
  const [previousHomeworkCompleted, setPreviousHomeworkCompleted] =
    useState<boolean>(false);
  const [nextHomework, setNextHomework] = useState<string>('');
  const [tutorRemarks, setTutorRemarks] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && reportId) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const report = await getSessionReportById(reportId);

          setLessonTopic(report.data.lessonTopic || '');
          setCoveredMaterials(report.data.coveredMaterials || '');
          setProgress(report.data.progress || '');
          setLearningAssessment(report.data.learningAssessment || '');
          setActiveParticipation(report.data.activeParticipation || false);
          setConcentration(report.data.concentration || false);
          setWorksIndependently(report.data.worksIndependently || false);
          setCooperation(report.data.cooperation || false);
          setPreviousHomeworkCompleted(
            report.data.previousHomeworkCompleted || false
          );
          setNextHomework(report.data.nextHomework || '');
          setTutorRemarks(report.data.tutorRemarks || '');
          setSessionDate(
            format(new Date(report.data.session.date), 'yyyy-MM-dd')
          );
          setStudentName(
            `${report.data.student.user.firstName} ${report.data.student.user.lastName}`
          );
        } catch (error) {
          console.error('Error fetching session report:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [isOpen, reportId]);

  const handleSave = async () => {
    try {
      await updateSessionReport(reportId, {
        lessonTopic,
        coveredMaterials,
        progress,
        learningAssessment,
        activeParticipation,
        concentration,
        worksIndependently,
        cooperation,
        previousHomeworkCompleted,
        nextHomework,
        tutorRemarks
      });
      onClose();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSessionReport(reportId);
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting session report:', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Session Report for <strong>{studentName}</strong>
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          flex: 1,
          overflow: 'auto'
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        ) : isEditable ? (
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            {/* Session Details */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Student Name"
                  value={studentName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t("session_date")}
                  value={sessionDate}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t("lesson_topic")}
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Covered Materials"
                  value={coveredMaterials}
                  onChange={(e) => setCoveredMaterials(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Progress"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Learning Assessment */}
            <Typography variant="h6" gutterBottom>
              Learning Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Assessment"
                  value={learningAssessment}
                  onChange={(e) => setLearningAssessment(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Next Homework"
                  value={nextHomework}
                  onChange={(e) => setNextHomework(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t("tutor_remarks")}
                  value={tutorRemarks}
                  onChange={(e) => setTutorRemarks(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Behavioral Assessment */}
            <Typography variant="h6" gutterBottom>
              Behavioral Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Active Participation</InputLabel>
                  <Select
                    label={t("active_participation")}
                    value={activeParticipation ? 'Yes' : 'No'}
                    onChange={(e) =>
                      setActiveParticipation(e.target.value === 'Yes')
                    }
                    inputProps={{ readOnly: !isEditable }}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Concentration</InputLabel>
                  <Select
                    label="Concentration"
                    value={concentration ? 'Yes' : 'No'}
                    onChange={(e) => setConcentration(e.target.value === 'Yes')}
                    inputProps={{ readOnly: !isEditable }}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3} mt={2}>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Student Name:</strong> {studentName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Session Date:</strong> {sessionDate}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Lesson Topic:</strong> {lessonTopic}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Covered Materials:</strong> {coveredMaterials}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Progress:</strong> {progress}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* Learning Assessment */}
            <Typography variant="h6" gutterBottom>
              Learning Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Assessment:</strong> {learningAssessment}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Next Homework:</strong> {nextHomework}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Tutor Remarks:</strong> {tutorRemarks}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* Behavioral Assessment */}
            <Typography variant="h6" gutterBottom>
              Behavioral Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Active Participation:</strong>{' '}
                  {activeParticipation ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Concentration:</strong> {concentration ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Works Independently:</strong>{' '}
                  {worksIndependently ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Cooperation:</strong> {cooperation ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Previous Homework Completed:</strong>{' '}
                  {previousHomeworkCompleted ? 'Yes' : 'No'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      {isEditable && (
        <DialogActions>
          <Button onClick={handleDelete} color="error">
            {t('delete')}
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {t('save')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ViewSessionReportForm;
