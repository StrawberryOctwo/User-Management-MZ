import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, CircularProgress } from '@mui/material';
import { getSessionReportById, updateSessionReport, deleteSessionReport } from 'src/services/sessionReportService';  // Ensure the services are imported
import { format } from 'date-fns';

interface ViewSessionReportFormProps {
    isOpen: boolean;
    reportId: string;
    onClose: () => void;
    onDelete: () => void;
}

const ViewSessionReportForm: React.FC<ViewSessionReportFormProps> = ({
    isOpen,
    onClose,
    reportId,
    onDelete,
}) => {
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
    const [sessionDate, setSessionDate] = useState<string>('');
    const [studentName, setStudentName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);  // Track loading state for the form data

    // Fetch the session report when the dialog opens
    useEffect(() => {
        if (isOpen && reportId) {
            const fetchReport = async () => {
                setLoading(true);
                try {
                    const report = await getSessionReportById(reportId);  // Fetch the report by ID

                    // Set all fields to the values from the fetched report

                    setLessonTopic(report.data.lessonTopic || '');
                    setCoveredMaterials(report.data.coveredMaterials || '');
                    setProgress(report.data.progress || '');
                    setLearningAssessment(report.data.learningAssessment || '');
                    setActiveParticipation(report.data.activeParticipation || false);
                    setConcentration(report.data.concentration || false);
                    setWorksIndependently(report.data.worksIndependently || false);
                    setCooperation(report.data.cooperation || false);
                    setPreviousHomeworkCompleted(report.data.previousHomeworkCompleted || false);
                    setNextHomework(report.data.nextHomework || '');
                    setTutorRemarks(report.data.tutorRemarks || '');

                    // Set session date and student name, which are read-only
                    setSessionDate(format(new Date(report.data.session.sessionStartDate), 'yyyy-MM-dd'));
                    setStudentName(`${report.data.student.user.firstName} ${report.data.student.user.lastName}`);
                } catch (error) {
                    console.error('Error fetching session report:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchReport();
        }
    }, [isOpen, reportId]);

    // Reset form fields when dialog closes
    useEffect(() => {
        if (!isOpen) {

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
        }
    }, [isOpen]);

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
            onClose();   // Close the dialog after saving
        } catch (error) {
            console.error('Error updating report:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSessionReport(reportId);  // Delete the report
            onDelete();  // Call parent to remove the report from the list
            onClose();   // Close the dialog after deletion
        } catch (error) {
            console.error('Error deleting session report:', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>View/Edit Session Report for {studentName}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={2}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>

                        {/* Read-Only Fields */}
                        <TextField
                            label="Student Name"
                            value={studentName}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />

                        <TextField
                            label="Session Date"
                            value={sessionDate}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />

                        <TextField
                            label="Lesson Topic"
                            value={lessonTopic}
                            onChange={(e) => setLessonTopic(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Covered Materials"
                            value={coveredMaterials}
                            onChange={(e) => setCoveredMaterials(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Progress"
                            value={progress}
                            onChange={(e) => setProgress(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Learning Assessment"
                            value={learningAssessment}
                            onChange={(e) => setLearningAssessment(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Next Homework"
                            value={nextHomework}
                            onChange={(e) => setNextHomework(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Tutor Remarks"
                            value={tutorRemarks}
                            onChange={(e) => setTutorRemarks(e.target.value)}
                            fullWidth
                        />

                        {/* Boolean fields */}
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Active Participation"
                                select
                                value={activeParticipation ? 'Yes' : 'No'}
                                onChange={(e) => setActiveParticipation(e.target.value === 'Yes')}
                                fullWidth
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>

                            <TextField
                                label="Concentration"
                                select
                                value={concentration ? 'Yes' : 'No'}
                                onChange={(e) => setConcentration(e.target.value === 'Yes')}
                                fullWidth
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                        </Box>

                        <Box display="flex" gap={2}>
                            <TextField
                                label="Works Independently"
                                select
                                value={worksIndependently ? 'Yes' : 'No'}
                                onChange={(e) => setWorksIndependently(e.target.value === 'Yes')}
                                fullWidth
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>

                            <TextField
                                label="Cooperation"
                                select
                                value={cooperation ? 'Yes' : 'No'}
                                onChange={(e) => setCooperation(e.target.value === 'Yes')}
                                fullWidth
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                        </Box>

                        <Box display="flex" gap={2}>
                            <TextField
                                label="Previous Homework Completed"
                                select
                                value={previousHomeworkCompleted ? 'Yes' : 'No'}
                                onChange={(e) => setPreviousHomeworkCompleted(e.target.value === 'Yes')}
                                fullWidth
                            >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </TextField>
                        </Box>

                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete} color="error">
                    Delete Report
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained">
                    Save Report
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewSessionReportForm;
