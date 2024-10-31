import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { getPaymentsForUserByClassSession } from 'src/services/paymentService';

interface ViewPaymentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    studentName: string;
    sessionId: string;
}

const ViewPaymentDetails: React.FC<ViewPaymentDetailsProps> = ({ isOpen, onClose, userId, studentName, sessionId }) => {
    const [payment, setPayment] = useState<any | null>(null);  // Change to an object or null
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen && userId) { 
            const fetchPayment = async () => {
                setLoading(true);
                try {
                    const response = await getPaymentsForUserByClassSession(userId, sessionId);
                    setPayment(response);  // Assuming `response` is a single payment object
                } catch (error) {
                    console.error('Error fetching payment:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchPayment();
        }
    }, [isOpen, userId, sessionId]);

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Payment Details for {studentName}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Typography>Loading payment...</Typography>
                ) : payment ? (
                    <Box>
                        <Typography><strong>Amount:</strong> ${payment.amount}</Typography>
                        <Typography><strong>Status:</strong> {payment.paymentStatus}</Typography>
                        <Typography><strong>Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}</Typography>
                    </Box>
                ) : (
                    <Typography>No payment found for this student.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewPaymentDetails;
