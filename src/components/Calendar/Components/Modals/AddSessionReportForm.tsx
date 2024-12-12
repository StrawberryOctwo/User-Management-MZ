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
  Typography,
  CircularProgress,
  Divider,
  styled
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addSessionReport } from 'src/services/sessionReportService';

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
    border: `2px solid ${
      theme.palette.mode === 'dark'
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
  scrollbarColor: `${theme.palette.primary.main} ${
    theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.background.default
  }`,
}));

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
  const [loading, setLoading] = useState(false);
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
    nextHomework: '',
    tutorRemarks: '',
    participationNotes: '',
    concentrationNotes: '',
    independentWorkNotes: '',
    cooperationNotes: ''
  });

  const handleChange =
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleSave = async () => {
    // Basic form validation
    if (!formData.lessonTopic || !formData.coveredMaterials) {
      alert(t('Please fill out all required fields.'));
      return;
    }

    setLoading(true);
    try {
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
      onSave(newReport);
      onClose();
    } catch (error) {
      console.error('Error saving session report:', error);
      alert(t('An error occurred while saving the report. Please try again.'));
    } finally {
      setLoading(false);
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
              <strong>{t('Session Date')}:</strong> {sessionDate || '-'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              <strong>{t('Student')}:</strong> {studentName || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>{t('Teacher')}:</strong> 
              {teacher?.user?.firstName
                ? `${teacher.user.firstName} ${teacher.user.lastName}`
                : '-'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <StyledDialogContent dividers>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Lesson Content Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('1. Lesson Content')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('Topic of the Lesson')}
                value={formData.lessonTopic}
                onChange={handleChange('lessonTopic')}
                fullWidth
                required
              />
              <TextField
                label={t('Covered Topics/Exercises')}
                value={formData.coveredMaterials}
                onChange={handleChange('coveredMaterials')}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Box>
          </Box>

          {/* Progress & Learning Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('2. Progress & Learning')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t('Progress')}</FormLabel>
                <RadioGroup
                  value={formData.progress}
                  onChange={handleChange('progress')}
                  row
                >
                  <FormControlLabel value="very-good" control={<Radio />} label={t('Very Good')} />
                  <FormControlLabel value="good" control={<Radio />} label={t('Good')} />
                  <FormControlLabel value="needs-improvement" control={<Radio />} label={t('Needs Improvement')} />
                  <FormControlLabel value="difficult" control={<Radio />} label={t('Difficult')} />
                </RadioGroup>
              </FormControl>
              <TextField
                label={t('Brief Explanation/Assessment of Learning Progress')}
                value={formData.learningAssessment}
                onChange={handleChange('learningAssessment')}
                multiline
                rows={3}
                fullWidth
                required
              />
            </Box>
          </Box>

          {/* Attention Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('3. Attention')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
              <Box key={field} sx={{ mb: 3 }}>
                <FormLabel>{label}</FormLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <TextField
                    label={t('Notes')}
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
                    <FormControlLabel value="yes" control={<Radio />} label={t('Yes')} />
                    <FormControlLabel value="no" control={<Radio />} label={t('No')} />
                  </RadioGroup>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Homework & Notes Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('4. Homework & Notes')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {/* Homework Subsection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('Homework')}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <FormLabel>{t('Previous homework completed')}</FormLabel>
                <RadioGroup
                  value={formData.previousHomeworkCompleted}
                  onChange={handleChange('previousHomeworkCompleted')}
                  row
                >
                  <FormControlLabel value="yes" control={<Radio />} label={t('Yes')} />
                  <FormControlLabel value="no" control={<Radio />} label={t('No')} />
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
                  />
                  <FormControlLabel
                    value="school-materials"
                    control={<Radio />}
                    label={t('School Materials')}
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            {/* Notes Subsection */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {t('Notes from the Tutor')}
              </Typography>
              <TextField
                label={t('Additional Comments')}
                value={formData.tutorRemarks}
                onChange={handleChange('tutorRemarks')}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
            </Box>
          </Box>
        </Box>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t('Cancel')}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('Save')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddSessionReportForm;
