import React, { useState } from 'react';
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
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addSessionReport } from 'src/services/sessionReportService';
import { t } from 'i18next';

interface AddSessionReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newReport: any) => void;
  studentName: string;
  classSessionId: string;
  studentId: string;
  user: any;
  teacher: any;
  sessionDate: string;
}

const steps = [
  'Lesson Content',
  'Progress & Learning',
  'Attention',
  'Homework & Notes'
];

const StepContent = ({
  step,
  formData,
  handleChange,
  user,
  teacher,
  sessionDate
}) => {
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
          />
          <TextField
            label="Covered Topics/Exercises"
            value={formData.coveredMaterials}
            onChange={handleChange('coveredMaterials')}
            fullWidth
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
            >
              <Box display="flex">
                <FormControlLabel
                  value="very-good"
                  control={<Radio />}
                  label="Very Good"
                />
                <FormControlLabel
                  value="good"
                  control={<Radio />}
                  label="Good"
                />
                <FormControlLabel
                  value="needs-improvement"
                  control={<Radio />}
                  label="Needs Improvement"
                />
                <FormControlLabel
                  value="difficult"
                  control={<Radio />}
                  label="Difficult"
                />
              </Box>
            </RadioGroup>
          </FormControl>
          <TextField
            label="Brief Explanation/Assessment of Learning Progress"
            value={formData.learningAssessment}
            onChange={handleChange('learningAssessment')}
            multiline
            rows={3}
            fullWidth
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
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}
              >
                <TextField
                  label={t("notes")}
                  value={formData[inputField]}
                  onChange={handleChange(inputField)}
                  size="small"
                  fullWidth
                />
                <RadioGroup
                  value={formData[field]}
                  onChange={handleChange(field)}
                  row
                  sx={{ minWidth: '150px' }}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio size="small" />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />}
                    label="No"
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
                value={formData.previousHomeworkCompleted}
                onChange={handleChange('previousHomeworkCompleted')}
                row
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>Homework for the next session</FormLabel>
              <RadioGroup
                value={formData.nextHomework}
                onChange={handleChange('nextHomework')}
                row
              >
                <FormControlLabel
                  value="worksheets"
                  control={<Radio />}
                  label="Worksheets"
                />
                <FormControlLabel
                  value="school-materials"
                  control={<Radio />}
                  label="School materials"
                />
              </RadioGroup>
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
            />
          </Box>
        </Box>
      );

    default:
      return null;
  }
};

const AddSessionReportForm: React.FC<AddSessionReportFormProps> = ({
  isOpen,
  onClose,
  onSave,
  studentName,
  classSessionId,
  studentId,
  user,
  teacher,
  sessionDate
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    lessonTopic: '',
    coveredMaterials: '',
    progress: 'good',
    learningAssessment: '',
    activeParticipation: 'no',
    concentration: 'no',
    worksIndependently: 'no',
    cooperation: 'no',
    previousHomeworkCompleted: 'no',
    nextHomework: 'worksheets',
    tutorRemarks: '',
    participationNotes: '',
    concentrationNotes: '',
    independentWorkNotes: '',
    cooperationNotes: ''
  });

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const handleChange =
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    try {
      // {t("(save")} the session report
      const newReport = {
        ...formData,
        studentId: studentId,
        classSessionId: classSessionId,
        activeParticipation: formData.activeParticipation === 'yes',
        concentration: formData.concentration === 'yes',
        worksIndependently: formData.worksIndependently === 'yes',
        cooperation: formData.cooperation === 'yes',
        previousHomeworkCompleted: formData.previousHomeworkCompleted === 'yes'
      };
      await addSessionReport(newReport);
      onClose();
    } catch (error) {
      console.error('Error saving session report:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h6">{t('Lesson Protocol')}</Typography>
            <Typography variant="body1">
              <strong>{t('session_date')}:</strong> {sessionDate || '-'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body1">
              <strong>{t('student')}:</strong>{' '}
              {user?.user?.firstName
                ? `${user.user.firstName} ${user.user.lastName}`
                : '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{t('teacher')}:</strong>{' '}
              {teacher?.user?.firstName
                ? `${teacher.user.firstName} ${teacher.user.lastName}`
                : '-'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step
                key={label}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleStepClick(index)}
              >
                <StepLabel
                  StepIconProps={{
                    sx: {
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s'
                      }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 4 }}>
            <StepContent
              step={activeStep}
              formData={formData}
              handleChange={handleChange}
              user={user}
              teacher={teacher}
              sessionDate={sessionDate}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t('{t("(cancel")}')}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && <Button onClick={handleBack}>{t('Back')}</Button>}
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSave} variant="contained" color="primary">
              {t('{t("(save")}')}
            </Button>
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

export default AddSessionReportForm;
