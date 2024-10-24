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
import AddSessionReportForm from './AddSessionReportForm';
import ViewSessionReportForm from './ViewSessionReport';
import ViewPaymentDetails from './ViewPaymentDetails';  // New Component for payment view
import StudentDetailCard from './StudentDetailCArd';

interface ClassSessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
    onEdit: () => void;
    canEdit: boolean;
}

const ClassSessionDetailsModal: React.FC<ClassSessionDetailsModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    onEdit,
    canEdit
}) => {
    const [classSession, setClassSession] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reportStatus, setReportStatus] = useState<{ [studentId: string]: { reportCompleted: boolean, reportId: string | null } }>({});
    const [allReportsCompleted, setAllReportsCompleted] = useState<boolean>(false);
    const [isReportFormOpen, setReportFormOpen] = useState<boolean>(false);
    const [isViewReportFormOpen, setViewReportFormOpen] = useState<boolean>(false);
    const [isViewPaymentModalOpen, setViewPaymentModalOpen] = useState<boolean>(false);  // State for payment modal
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    // Fetch class session details
    const loadClassSession = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const response = await fetchClassSessionById(appointmentId);
            setClassSession(response);

            const reportResponse = await getClassSessionReportsStatus(appointmentId);
            setAllReportsCompleted(reportResponse.allReportsCompleted);

            const studentReportsStatus: { [studentId: string]: { reportCompleted: boolean, reportId: string | null } } = {};
            for (const student of response.students) {
                const studentReport = await getStudentSessionReportStatus(appointmentId, student.id);
                studentReportsStatus[student.id] = {
                    reportCompleted: studentReport.reportCompleted,
                    reportId: studentReport.reportId,
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
        setViewPaymentModalOpen(true);  // Open payment modal for selected student
    };

    const refreshClassSessionData = async () => {
        await loadClassSession();
    };

    const handleSaveReport = async (newReport: any) => {
        refreshClassSessionData();
        setReportFormOpen(false);
    };

    const handleCloseReportForm = () => {
        setViewReportFormOpen(false);
        refreshClassSessionData();
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
                                    <strong>Session Name:</strong> {classSession.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Teacher:</strong> {classSession.teacher?.user?.firstName} {classSession.teacher?.user?.lastName}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Topic:</strong> {classSession.topic?.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Location:</strong> {classSession.location.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Session Type:</strong> {classSession.sessionType}
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
                                    reportCompleted={reportStatus[student.id]?.reportCompleted}
                                    onAddReport={() => handleAddReport(student)}
                                    onViewReport={() => handleViewReport(student)}
                                    onViewPayment={() => handleViewPayment(student)}
                                />
                            ))
                        ) : (
                            <Typography variant="body2">No students enrolled.</Typography>
                        )}

                        {allReportsCompleted && (
                            <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
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
                            studentName={selectedStudent ? `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}` : ''}
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
                                student={selectedStudent}
                                classSessionId={appointmentId}
                                onDelete={handleCloseReportForm}
                            />
                        )}

                        {/* View Payment Details Modal */}
                        {selectedStudent && (
                            <ViewPaymentDetails
                                isOpen={isViewPaymentModalOpen}
                                onClose={() => setViewPaymentModalOpen(false)}
                                userId={selectedStudent.user.id}
                                studentName={`${selectedStudent.user.firstName} ${selectedStudent.user.lastName}`}
                                sessionId={classSession.id}
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
                {canEdit && (
                    <Button onClick={onEdit} color="primary" variant="contained">
                        Edit
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ClassSessionDetailsModal;
