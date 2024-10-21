import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
} from '@mui/material';
import moment from 'moment';
import { fetchClassSessionById, getClassSessionReportsStatus, getStudentSessionReportStatus } from 'src/services/classSessionService';
import AddSessionReportForm from './AddSessionReportForm';  // Import the Add Session Report form component
import StudentDetailCard from './StudentDetailCArd';
import ViewSessionReportForm from './ViewSessionReport';

interface ClassSessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
    onEdit: () => void;
}

const ClassSessionDetailsModal: React.FC<ClassSessionDetailsModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    onEdit,
}) => {
    const [classSession, setClassSession] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reportStatus, setReportStatus] = useState<{ [studentId: string]: { reportCompleted: boolean, reportId: string | null } }>({});
    const [allReportsCompleted, setAllReportsCompleted] = useState<boolean>(false);
    const [isReportFormOpen, setReportFormOpen] = useState<boolean>(false);  // State for session report form
    const [isViewReportFormOpen, setViewReportFormOpen] = useState<boolean>(false);  // State for view/edit report form
    const [selectedStudent, setSelectedStudent] = useState<any>(null);  // Store the selected student for report
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);  // Store the report ID to view/edit

    // Fetch class session details
    const loadClassSession = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            // Fetch class session details by ID
            const response = await fetchClassSessionById(appointmentId);
            setClassSession(response);

            // Fetch session report status for the entire class session
            const reportResponse = await getClassSessionReportsStatus(appointmentId);
            setAllReportsCompleted(reportResponse.allReportsCompleted);

            // Fetch report status for each student and store reportCompleted + reportId
            const studentReportsStatus: { [studentId: string]: { reportCompleted: boolean, reportId: string | null } } = {};
            for (const student of response.students) {
                const studentReport = await getStudentSessionReportStatus(appointmentId, student.id);
                studentReportsStatus[student.id] = {
                    reportCompleted: studentReport.reportCompleted,
                    reportId: studentReport.reportId,  // Include reportId in the status
                };
            }

            // Update the state with the reports' status
            setReportStatus(studentReportsStatus);

        } catch (error) {
            setErrorMessage('Failed to load class session details.');
            console.error('Error fetching class session details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Call `loadClassSession` when the modal is opened or `appointmentId` changes
    useEffect(() => {
        if (isOpen && appointmentId) {
            const loadClassSession = async () => {
                setLoading(true);
                setErrorMessage(null);
                try {
                    const response = await fetchClassSessionById(appointmentId);
                    setClassSession(response);
                } catch (error) {
                    setErrorMessage("Failed to load class session details.");
                } finally {
                    setLoading(false);
                }
            };

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
            setSelectedReportId(reportData.reportId);  // Set the correct reportId
            setViewReportFormOpen(true);  // Open the view report form
        } else {
            console.log('No report available for this student');
        }
    };

    // Refresh class session data after adding or editing a report
    const refreshClassSessionData = async () => {
        await loadClassSession();  // Re-fetch class session details and report statuses
    };

    const handleSaveReport = async (newReport: any) => {
        // After saving, refresh the class session data
        refreshClassSessionData();
        setReportFormOpen(false);
    };

    const handleCloseReportForm = () => {
        setViewReportFormOpen(false);
        refreshClassSessionData();  // Refresh data after closing view/edit form
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Class Session Details</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : errorMessage ? (
                    <Typography color="error">{errorMessage}</Typography>
                ) : classSession ? (
                    <Box>
                        <Card variant="outlined" sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="subtitle1">
                                    <strong>Name:</strong> {classSession.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Teacher:</strong> {classSession.teacher?.user?.firstName} {classSession.teacher?.user?.lastName}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Topic:</strong> {classSession.topic?.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Start Time:</strong> {moment(classSession.sessionStartDate).format('LLL')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>End Time:</strong> {moment(classSession.sessionEndDate).format('LLL')}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Typography variant="subtitle1"><strong>Students Enrolled:</strong></Typography>
                        {classSession.students?.length > 0 ? (
                            classSession.students.map((student: any) => (
                                <StudentDetailCard
                                    key={student.id}
                                    student={student}
                                    reportCompleted={reportStatus[student.id]?.reportCompleted}  // Use report status to determine if the report is completed
                                    onAddReport={() => handleAddReport(student)}  // Open the Add Report form
                                    onViewReport={() => handleViewReport(student)}  // Pass report ID and student to view report
                                />
                            ))
                        ) : (
                            <Typography variant="body2">No students enrolled.</Typography>
                        )}

                        {/* Display "Paid" in green if all session reports are completed */}
                        {allReportsCompleted && (
                            <Typography variant="h6" color="green" sx={{ mt: 2 }}>
                                Paid
                            </Typography>
                        )}

                        {/* Add Session Report Form Dialog */}
                        <AddSessionReportForm
                            isOpen={isReportFormOpen}
                            onClose={() => setReportFormOpen(false)}
                            onSave={handleSaveReport}  // Save report and refresh data
                            studentName={selectedStudent ? `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}` : ''}
                            classSessionId={appointmentId}
                            studentId={selectedStudent ? selectedStudent.id : ''}
                        />

                        {/* View Session Report Form Dialog */}
                        {selectedStudent && selectedReportId && (
                            <ViewSessionReportForm
                                isOpen={isViewReportFormOpen}
                                onClose={handleCloseReportForm}
                                reportId={selectedReportId} // Pass the report ID
                                student={selectedStudent}
                                classSessionId={appointmentId}
                                onDelete={handleCloseReportForm}  // Call refresh after deletion
                            />
                        )}
                    </Box>
                ) : (
                    <Typography>No class session details available.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Close
                </Button>
                <Button onClick={onEdit} color="primary" variant="contained">
                    Edit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClassSessionDetailsModal;
