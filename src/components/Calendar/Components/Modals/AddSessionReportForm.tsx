import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Box } from '@mui/material';
import { useTranslation } from 'react-i18next'; // Import translation hook
import { addSessionReport } from 'src/services/sessionReportService';
import { fetchClassSessionById } from 'src/services/classSessionService';
import { createPaymentForUser, getStudentPaymentDetails } from 'src/services/paymentService.';

interface AddSessionReportFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newReport: any) => void;
    studentName: string;
    classSessionId: string;
    studentId: string;
    userId: string;
}

const AddSessionReportForm: React.FC<AddSessionReportFormProps> = ({ isOpen, onClose, onSave, studentName, classSessionId, studentId,userId  }) => {
    const { t } = useTranslation();  // Use translation hook to access locale
    const [reportType, setReportType] = useState<string>('');
    const [comments, setComments] = useState<string>('');
    const [groupSessionPrice, setGroupSessionPrice] = useState<number>(0);
    const [individualSessionPrice, setIndividualSessionPrice] = useState<number>(0);
    const [sessionType, setSessionType] = useState<string>('');  // Will be "group" or "1on1"

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
                console.log(paymentDetails)
            } catch (error) {
                console.error('Error fetching session or payment details:', error);
            }
        };

        if (isOpen) {
            fetchSessionAndPaymentDetails();
        }

        if (!isOpen) {
            setReportType('');
            setComments('');
        }
    }, [isOpen, classSessionId, studentId]);

    // Function to calculate payment amount based on session type
    const calculatePaymentAmount = () => {
        const translated1on1 = t('1on1');  // Fetch "1on1" from locale
        return sessionType === translated1on1 ? individualSessionPrice : groupSessionPrice;
    };

    const handleSave = async () => {
        if (reportType && comments) {
            try {
                // Create session report
                const newReport = await addSessionReport({
                    reportType,
                    comments,
                    classSessionId,
                    studentId,
                });
    
                onSave(newReport);  // Pass the newly created report to the parent to refresh UI
    
                // Try to create payment after report submission, but don't stop if it fails
                const paymentAmount = calculatePaymentAmount();
                try {
                    await createPaymentForUser({
                        amount: paymentAmount,
                        userId,
                        classSessionId,
                    });
                } catch (paymentError) {
                    console.error('Payment creation failed, but session report saved:', paymentError);
                }
    
                // Clear form fields and close the dialog
                setReportType('');  // Reset form fields
                setComments('');
                onClose();  // Close dialog
    
            } catch (error) {
                console.error('Error saving session report:', error);
            }
        }
    };
    

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('Add Session Report for')} {studentName}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                        label={t('Report Type')}
                        select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        fullWidth
                        required
                    >
                        <MenuItem value="Attendance">{t('Attendance')}</MenuItem>
                        <MenuItem value="Performance">{t('Performance')}</MenuItem>
                        <MenuItem value="Behavior">{t('Behavior')}</MenuItem>
                    </TextField>

                    <TextField
                        label={t('Comments')}
                        multiline
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        fullWidth
                        required
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
