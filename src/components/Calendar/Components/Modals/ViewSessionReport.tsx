import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Typography,
  CircularProgress,
  styled
} from '@mui/material';
import {
  getSessionReportById,
  updateSessionReport,
  deleteSessionReport
} from 'src/services/sessionReportService';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface ViewSessionReportFormProps {
  isOpen: boolean;
  reportId: string;
  onClose: () => void;
  onDelete: () => void;
  isEditable?: boolean;
}

// Styled DialogContent with customized scrollbar
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  // For WebKit browsers
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    borderRadius: '4px',
    border: `2px solid ${theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.background.default
      }`,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.dark
        : theme.palette.primary.dark,
  },
  // For Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.primary.main} ${theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.background.default
    }`,
}));



const ViewSessionReportForm: React.FC<ViewSessionReportFormProps> = ({
  isOpen,
  onClose,
  reportId,
  onDelete,
  isEditable = false
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    lessonTopic: '',
    coveredMaterials: '',
    progress: 'good',
    learningAssessment: '',
    activeParticipation: false,
    participationNotes: '',
    concentration: false,
    concentrationNotes: '',
    worksIndependently: false,
    independentWorkNotes: '',
    cooperation: false,
    cooperationNotes: '',
    previousHomeworkCompleted: false,
    nextHomework: '',
    tutorRemarks: '',
    sessionDate: '',
    startTime: '',
    studentName: ''
  });

  useEffect(() => {
    if (isOpen && reportId) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const report = await getSessionReportById(reportId);
          setFormData({
            lessonTopic: report.data.lessonTopic || '',
            coveredMaterials: report.data.coveredMaterials || '',
            progress: report.data.progress || 'good',
            learningAssessment: report.data.learningAssessment || '',
            activeParticipation: report.data.activeParticipation || false,
            participationNotes: report.data.participationNotes || '',
            concentration: report.data.concentration || false,
            concentrationNotes: report.data.concentrationNotes || '',
            worksIndependently: report.data.worksIndependently || false,
            independentWorkNotes: report.data.independentWorkNotes || '',
            cooperation: report.data.cooperation || false,
            cooperationNotes: report.data.cooperationNotes || '',
            previousHomeworkCompleted: report.data.previousHomeworkCompleted || false,
            nextHomework: report.data.nextHomework || '',
            tutorRemarks: report.data.tutorRemarks || '',
            sessionDate: format(new Date(report.data.session.date), 'yyyy-MM-dd'),
            startTime: report.data.session.startTime,
            studentName: `${report.data.student.user.firstName} ${report.data.student.user.lastName}`
          });
        } catch (error) {
          console.error('Error fetching session report:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [isOpen, reportId]);

  const handleChange = (field: string) => (e: any) => {
    let value = e.target.value;
    if (e.target.type === 'radio') {
      if (
        [
          'activeParticipation',
          'concentration',
          'worksIndependently',
          'cooperation',
          'previousHomeworkCompleted'
        ].includes(field)
      ) {
        value = e.target.value === 'yes';
      } else {
        value = e.target.value;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSessionReport(reportId, formData);
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
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('Lesson Protocol')}</Typography>
            <Typography variant="body1">
              <strong>{t('Session Date')}:</strong> {formData.sessionDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              <strong>{t('Student')}:</strong> {formData.studentName}
            </Typography>
            <Typography variant="body1">
              <strong>{t('Start')}:</strong> {formData.startTime}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <StyledDialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', mt: 2 }}>
            {/* Lesson Content Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('1. Lesson Content')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={t('Topic of the Lesson')}
                  value={formData.lessonTopic}
                  onChange={handleChange('lessonTopic')}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label={t('Covered Topics/Exercises')}
                  value={formData.coveredMaterials}
                  onChange={handleChange('coveredMaterials')}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Box>
            </Box>

            {/* Progress & Learning Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('2. Progress & Learning')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t('Progress')}</FormLabel>
                  <RadioGroup
                    value={formData.progress}
                    onChange={handleChange('progress')}
                    row
                  >
                    <FormControlLabel
                      value="very-good"
                      control={<Radio />}
                      label={t('Very Good')}
                      disabled={!isEditable}
                    />
                    <FormControlLabel
                      value="good"
                      control={<Radio />}
                      label={t('Good')}
                      disabled={!isEditable}
                    />
                    <FormControlLabel
                      value="needs-improvement"
                      control={<Radio />}
                      label={t('Needs Improvement')}
                      disabled={!isEditable}
                    />
                    <FormControlLabel
                      value="difficult"
                      control={<Radio />}
                      label={t('Difficult')}
                      disabled={!isEditable}
                    />
                  </RadioGroup>
                </FormControl>
                <TextField
                  label={t('Brief Explanation/Assessment of Learning Progress')}
                  value={formData.learningAssessment}
                  onChange={handleChange('learningAssessment')}
                  multiline
                  rows={3}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Box>
            </Box>

            {/* Attention Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('3. Attention')}
              </Typography>
              {[
                {
                  field: 'activeParticipation',
                  label: t('Regular and active participation in class'),
                  inputField: 'participationNotes'
                },
                {
                  field: 'concentration',
                  label: t('Remains focused'),
                  inputField: 'concentrationNotes'
                },
                {
                  field: 'worksIndependently',
                  label: t('Works independently'),
                  inputField: 'independentWorkNotes'
                },
                {
                  field: 'cooperation',
                  label: t('Cooperative'),
                  inputField: 'cooperationNotes'
                }
              ].map(({ field, label, inputField }) => (
                <Box key={field} sx={{ mb: 2 }}>
                  <FormLabel>{label}</FormLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <TextField
                      label={t('Notes')}
                      value={formData[inputField]}
                      onChange={handleChange(inputField)}
                      size="small"
                      fullWidth
                      InputProps={{ readOnly: !isEditable }}
                    />
                    <RadioGroup
                      value={formData[field] ? 'yes' : 'no'}
                      onChange={handleChange(field)}
                      row
                      sx={{ minWidth: '150px' }}
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio size="small" />}
                        label={t('Yes')}
                        disabled={!isEditable}
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio size="small" />}
                        label={t('No')}
                        disabled={!isEditable}
                      />
                    </RadioGroup>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Homework & Notes Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('4. Homework & Notes')}
              </Typography>
              <Box>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <FormLabel>{t('Previous homework completed')}</FormLabel>
                  <RadioGroup
                    value={formData.previousHomeworkCompleted ? 'yes' : 'no'}
                    onChange={handleChange('previousHomeworkCompleted')}
                    row
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label={t('Yes')}
                      disabled={!isEditable}
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label={t('No')}
                      disabled={!isEditable}
                    />
                  </RadioGroup>
                </FormControl>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <FormLabel>{t('Homework for the next session')}</FormLabel>
                  <RadioGroup
                    value={formData.nextHomework}
                    onChange={handleChange('nextHomework')}
                    row
                  >
                    <FormControlLabel
                      value="worksheets"
                      control={<Radio />}
                      label={t('Worksheets')}
                      disabled={!isEditable}
                    />
                    <FormControlLabel
                      value="school-materials"
                      control={<Radio />}
                      label={t('School Materials')}
                      disabled={!isEditable}
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Box sx={{ mt: 2 }}>
                <FormLabel component="legend">{t('Notes from the Tutor')}</FormLabel>
                <TextField
                  label={t('Additional Comments')}
                  value={formData.tutorRemarks}
                  onChange={handleChange('tutorRemarks')}
                  multiline
                  rows={4}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: !isEditable }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </StyledDialogContent>
      <DialogActions>
        {isEditable && (
          <Button onClick={handleDelete} color="error" sx={{ mr: 1 }}>
            {t('Delete')}
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditable && (
            <Button onClick={handleSave} variant="contained" color="primary">
              {t('Save')}
            </Button>
          )}
          <Button onClick={onClose}>{t('Close')}</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSessionReportForm;
