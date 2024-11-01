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
    CircularProgress,
    Tabs,
    Tab,
} from '@mui/material';
import moment from 'moment';
import { deleteClassSession, fetchClassSessionById, getClassSessionReportsStatus, getStudentSessionReportStatus } from 'src/services/classSessionService';
import AddSessionReportForm from './AddSessionReportForm';
import ViewSessionReportForm from './ViewSessionReport';
import ViewPaymentDetails from './ViewPaymentDetails';  // New Component for payment view
import StudentDetailCard from './StudentDetailCArd';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { createPaymentForUser, getPaymentsForUserByClassSession } from 'src/services/paymentService'; // Fix the path if needed
import { sessionTypeFunc } from 'src/utils/sessionType';
import AbsenceForm from './AbsenceTab';
import AbsenceTab from './AbsenceTab';

interface ClassSessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
    canAddReport: boolean;
}

const ClassSessionDetailsModal: React.FC<ClassSessionDetailsModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    onEdit,
    onDelete,
    canEdit,
    canAddReport
}) => {
    const [classSession, setClassSession] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reportStatus, setReportStatus] = useState<{ [studentId: string]: { reportCompleted: boolean, reportId: string | null } }>({});
    let [allReportsCompleted, setAllReportsCompleted] = useState<boolean>(false);
    const [isReportFormOpen, setReportFormOpen] = useState<boolean>(false);
    const [isViewReportFormOpen, setViewReportFormOpen] = useState<boolean>(false);
    const [isViewPaymentModalOpen, setViewPaymentModalOpen] = useState<boolean>(false);
    const [isAbsenceModalOpen, setAbsenceModalOpen] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    // Fetch class session details
    const loadClassSession = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetchClassSessionById(appointmentId);
            setClassSession(response);

            const reportResponse = await getClassSessionReportsStatus(appointmentId);
            console.log(reportResponse)
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




            // If all reports are completed, check if payment was already made
            if (allReportsCompleted) {
                const paymentStatusResponse = await getPaymentsForUserByClassSession(response.teacher.user.id, response.id)
                console.log(paymentStatusResponse);
                if (paymentStatusResponse) {
                    console.log('Payment already sent, skipping payment creation');
                } else {
                    try {
                        // Payment not sent, create the payment
                        await createPaymentForUser({
                            userId: response.teacher.user.id,
                            classSessionId: response.id,
                            sessionType: sessionTypeFunc(classSession.sessionType)

                        });
                        console.log('Payment successfully sent');
                    } catch (paymentError) {
                        console.error('Error creating payment:', paymentError);
                    }
                }
            }
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

    const handleCloseAbsenceModel = () => {
        setAbsenceModalOpen(false);
        setSelectedStudent(null);
        refreshClassSessionData();
    };

    const handleDelete = async () => {
        setDeleteDialogOpen(true);
    };

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullWidth
            maxWidth={false}
            sx={{ '& .MuiDialog-paper': { width: '750px', maxWidth: '750px' } }} // Set the custom width

        >
            <DialogTitle>Class Session Details</DialogTitle>
            <DialogContent sx={{ minHeight: '370px' }} className='djfhjdf'>

                <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ mb: 2 }}>
                    <Tab label="Session Details" />
                    <Tab label="Students Enrolled" />
                </Tabs>

                {loading ? (
                    <Typography>Loading...</Typography>
                ) : errorMessage ? (
                    <Typography color="error">{errorMessage}</Typography>
                ) : classSession ? (
                    <Box sx={{ px: 1 }} >
                        {tabIndex === 0 && (
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
                                            reportCompleted={reportStatus[student.id]?.reportCompleted}
                                            onAddReport={() => handleAddReport(student)}
                                            onViewReport={() => handleViewReport(student)}
                                            onViewPayment={() => handleViewPayment(student)}
                                            handleAbsence={() => handleAbsence(student)}
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
                                        onDelete={handleCloseReportForm}
                                    />
                                )}

   

                                {selectedStudent && (
                                    <AbsenceTab
                                        classSessionId={classSession.id}
                                        isOpen={isAbsenceModalOpen}
                                        student={selectedStudent}
                                        onClose={handleCloseAbsenceModel}
                                    />
                                )}
                            </>
                        )}

                    </Box>
                ) : (
                    <Typography>No class session details available.</Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ marginBottom: 2 }}>
                <Box sx={{ flexGrow: 1, paddingLeft: 2 }}>
                    {canEdit && (
                        <Button
                            onClick={handleDelete}
                            style={{ color: 'white', backgroundColor: 'red', padding: '8px 16px' }}
                            variant="contained"
                        >
                            Delete
                        </Button>
                    )}
                </Box>
                <Box sx={{ paddingRight: 2 }}>
                    <Button onClick={onClose} color="secondary" style={{ padding: '8px 16px' }} sx={{ marginRight: 1 }}>
                        Close
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={onEdit}
                            color="primary"
                            variant="contained"
                            style={{ padding: '8px 16px' }}
                        >
                            Edit
                        </Button>
                    )}
                </Box>
            </DialogActions>


            <ReusableDialog
                open={deleteDialogOpen}
                title="Confirm Deletion"
                onClose={() => setDeleteDialogOpen(false)}
                actions={
                    <>
                        <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={onDelete}
                            color="primary"
                            autoFocus
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Confirm'}
                        </Button>
                    </>
                }
            >
                <p>Are you sure you want to delete the selected class session?</p>
            </ReusableDialog>

        </Dialog>
    );
};

export default ClassSessionDetailsModal;
