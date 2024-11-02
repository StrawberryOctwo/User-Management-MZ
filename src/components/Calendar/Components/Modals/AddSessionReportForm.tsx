import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Box, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next'; // Import translation hook
import { addSessionReport } from 'src/services/sessionReportService';
import { fetchClassSessionById } from 'src/services/classSessionService';
import { createPaymentForUser, getStudentPaymentDetails } from 'src/services/paymentService';
import { sessionTypeFunc } from 'src/utils/sessionType'
interface AddSessionReportFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newReport: any) => void;
    studentName: string;
    classSessionId: string;
    studentId: string;
    userId: string;
}

const AddSessionReportForm: React.FC<AddSessionReportFormProps> = ({ isOpen, onClose, onSave, studentName, classSessionId, studentId, userId }) => {
    const { t } = useTranslation();  // Use translation hook to access locale
    const [groupSessionPrice, setGroupSessionPrice] = useState<number>(0);
    const [individualSessionPrice, setIndividualSessionPrice] = useState<number>(0);
    const [sessionType, setSessionType] = useState<string>('');  // Will be "group" or "1on1"

    // New Fields
    const [lessonTopic, setLessonTopic] = useState<string>('');
    const [coveredMaterials, setCoveredMaterials] = useState<string>('');
    const [progress, setProgress] = useState<string>('');
    const [learningAssessment, setLearningAssessment] = useState<string>('');
    const [activeParticipation, setActiveParticipation] = useState<boolean>(false);
    const [concentration, setConcentration] = useState<boolean>(false);
    const [worksIndependently, setWorksIndependently] = useState<boolean>(false);
    const [cooperation, setCooperation] = useState<boolean>(false);
    const [previousHomeworkCompleted, setPreviousHomeworkCompleted] = useState<boolean>(false);
    const [nextHomework, setNextHomework] = useState<string>('');
    const [tutorRemarks, setTutorRemarks] = useState<string>('');

    // Fetch the session details and payment details
    useEffect(() => {
        const fetchSessionAndPaymentDetails = async () => {
            try {
                // Fetch session details (including session type)
                const sessionDetails = await fetchClassSessionById(classSessionId);
                setSessionType(sessionDetails.sessionType);  // Set session type (e.g., "1on1", "group")
 
                // Fetch payment details for the student
                const paymentDetails = await getStudentPaymentDetails(studentId);
                setGroupSessionPrice(paymentDetails.groupSessionPrice);
                setIndividualSessionPrice(paymentDetails.individualSessionPrice);
            } catch (error) {
                console.error('Error fetching session or payment details:', error);
            }
        };

        if (isOpen) {
            fetchSessionAndPaymentDetails();
        }


    }, [isOpen, classSessionId, studentId]);

    // Function to calculate payment amount based on session type

    const handleSave = async () => {
 
            try {
                // Create session report
                const newReport = await addSessionReport({
                    
                    classSessionId,
                    studentId,
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

                onSave(newReport);  // Pass the newly created report to the parent to refresh UI
  

                // Try to create payment after report submission, but don't stop if it fails
                try {
                    await createPaymentForUser({
                        userId,
                        classSessionId,
                        sessionType:sessionTypeFunc(sessionType)
                    });
                } catch (paymentError) {
                    console.error('Payment creation failed, but session report saved:', paymentError);
                }


                setLessonTopic('');
                setCoveredMaterials('');
                setProgress('');
                setLearningAssessment('');
                setActiveParticipation(false);
                setConcentration(false);
                setWorksIndependently(false);
                setCooperation(false);
                setPreviousHomeworkCompleted(false);
                setNextHomework('');
                setTutorRemarks('');
                onClose();  // Close dialog

            } catch (error) {
                console.error('Error saving session report:', error);
            
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('Add Session Report for')} {studentName}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>


                    <TextField
                        label={t('Lesson Topic')}
                        value={lessonTopic}
                        onChange={(e) => setLessonTopic(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t('Covered Materials')}
                        value={coveredMaterials}
                        onChange={(e) => setCoveredMaterials(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t('Progress')}
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t('Learning Assessment')}
                        value={learningAssessment}
                        onChange={(e) => setLearningAssessment(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />

                    <FormControlLabel
                        control={<Checkbox checked={activeParticipation} onChange={(e) => setActiveParticipation(e.target.checked)} />}
                        label={t('Active Participation')}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={concentration} onChange={(e) => setConcentration(e.target.checked)} />}
                        label={t('Concentration')}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={worksIndependently} onChange={(e) => setWorksIndependently(e.target.checked)} />}
                        label={t('Works Independently')}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={cooperation} onChange={(e) => setCooperation(e.target.checked)} />}
                        label={t('Cooperation')}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={previousHomeworkCompleted} onChange={(e) => setPreviousHomeworkCompleted(e.target.checked)} />}
                        label={t('Previous Homework Completed')}
                    />

                    <TextField
                        label={t('Next Homework')}
                        value={nextHomework}
                        onChange={(e) => setNextHomework(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t('Tutor Remarks')}
                        value={tutorRemarks}
                        onChange={(e) => setTutorRemarks(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />

 
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {t('Cancel')}
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained">
                    {t('Save Report')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSessionReportForm;
