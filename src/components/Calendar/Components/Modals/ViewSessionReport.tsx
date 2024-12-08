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
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress
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

const steps = [
  'Lesson Content',
  'Progress & Learning',
  'Attention',
  'Homework & Notes'
];

const StepContent = ({ step, formData, handleChange, readOnly }) => {
  switch (step) {
    case 0:
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormLabel component="legend">1. Lesson Content</FormLabel>
          <TextField
            label="Topic of the Lesson"
            value={formData.lessonTopic}
            onChange={handleChange('lessonTopic')}
            fullWidth
            InputProps={{ readOnly }}
          />
          <TextField
            label="Covered Topics/Exercises"
            value={formData.coveredMaterials}
            onChange={handleChange('coveredMaterials')}
            fullWidth
            InputProps={{ readOnly }}
          />
        </Box>
      );

    case 1:
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormLabel component="legend">2. Progress in this Lesson</FormLabel>
          <FormControl component="fieldset">
            <RadioGroup
              value={formData.progress}
              onChange={handleChange('progress')}
              row
            >
              <FormControlLabel
                value="very-good"
                control={<Radio />}
                label="Very Good"
                disabled={readOnly}
              />
              <FormControlLabel
                value="good"
                control={<Radio />}
                label="Good"
                disabled={readOnly}
              />
              <FormControlLabel
                value="needs-improvement"
                control={<Radio />}
                label="Needs Improvement"
                disabled={readOnly}
              />
              <FormControlLabel
                value="difficult"
                control={<Radio />}
                label="Difficult"
                disabled={readOnly}
              />
            </RadioGroup>
          </FormControl>
          <TextField
            label="Brief Explanation/Assessment of Learning Progress"
            value={formData.learningAssessment}
            onChange={handleChange('learningAssessment')}
            multiline
            rows={3}
            fullWidth
            InputProps={{ readOnly }}
          />
        </Box>
      );

    case 2:
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>
            Attention
          </FormLabel>
          {[
            {
              field: 'activeParticipation',
              label: 'Regular and active participation in class',
              inputField: 'participationNotes'
            },
            {
              field: 'concentration',
              label: 'Remains focused',
              inputField: 'concentrationNotes'
            },
            {
              field: 'worksIndependently',
              label: 'Works independently',
              inputField: 'independentWorkNotes'
            },
            {
              field: 'cooperation',
              label: 'Cooperative',
              inputField: 'cooperationNotes'
            }
          ].map(({ field, label, inputField }) => (
            <Box key={field} sx={{ mb: 2 }}>
              <FormLabel>{label}</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <TextField
                  label="Notes"
                  value={formData[inputField]}
                  onChange={handleChange(inputField)}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly }}
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
                    label="Yes"
                    disabled={readOnly}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />}
                    label="No"
                    disabled={readOnly}
                  />
                </RadioGroup>
              </Box>
            </Box>
          ))}
        </Box>
      );

    case 3:
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <FormLabel component="legend">3. Homework</FormLabel>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>Previous homework completed</FormLabel>
              <RadioGroup
                value={formData.previousHomeworkCompleted ? 'yes' : 'no'}
                onChange={handleChange('previousHomeworkCompleted')}
                row
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio />}
                  label="Yes"
                  disabled={readOnly}
                />
                <FormControlLabel
                  value="no"
                  control={<Radio />}
                  label="No"
                  disabled={readOnly}
                />
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>Homework for the next session</FormLabel>
              <TextField
                value={formData.nextHomework}
                onChange={handleChange('nextHomework')}
                fullWidth
                multiline
                rows={2}
                InputProps={{ readOnly }}
              />
            </FormControl>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormLabel component="legend">4. Notes from the Tutor</FormLabel>
            <TextField
              label="Additional comments"
              value={formData.tutorRemarks}
              onChange={handleChange('tutorRemarks')}
              multiline
              rows={4}
              fullWidth
              margin="normal"
              InputProps={{ readOnly }}
            />
          </Box>
        </Box>
      );

    default:
      return null;
  }
};

const ViewSessionReportForm: React.FC<ViewSessionReportFormProps> = ({
  isOpen,
  onClose,
  reportId,
  onDelete,
  isEditable = false
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
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

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const handleChange = (field: string) => (e: any) => {
    let value = e.target.value;
    if (e.target.type === 'radio') {
      if (['activeParticipation', 'concentration', 'worksIndependently',
        'cooperation', 'previousHomeworkCompleted'].includes(field)) {
        value = e.target.value === 'yes';
      } else {
        value = e.target.value;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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
          <Typography variant="body1">
            <strong>{t('Student')}:</strong> {formData.studentName}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} sx={{ cursor: 'pointer' }} onClick={() => handleStepClick(index)}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ mt: 4 }}>
              <StepContent
                step={activeStep}
                formData={formData}
                handleChange={handleChange}
                readOnly={!isEditable}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {isEditable && (
          <Button onClick={handleDelete} color="error" sx={{ mr: 1 }}>
            {t('Delete')}
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack}>{t('Back')}</Button>
          )}
          {activeStep === steps.length - 1 ? (
            isEditable && (
              <Button onClick={handleSave} variant="contained" color="primary">
                {t('Save')}
              </Button>
            )
          ) : (
            <Button onClick={handleNext} variant="contained" color="primary">
              {t('Next')}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSessionReportForm;