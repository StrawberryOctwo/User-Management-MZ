import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material';
import moment from 'moment';
import { fetchClassSessionById } from 'src/services/classSessionService';

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

    useEffect(() => {
        if (isOpen && appointmentId) {
            const loadClassSession = async () => {
                setLoading(true);
                setErrorMessage(null);
                try {
                    const response = await fetchClassSessionById(appointmentId);
                    console.log(response)
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

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Class Session Details</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : errorMessage ? (
                    <Typography color="error">{errorMessage}</Typography>
                ) : classSession ? (
                    <Box>
                        <Typography variant="subtitle1"><strong>Name:</strong> {classSession.name}</Typography>
                        <Typography variant="subtitle1"><strong>Teacher:</strong> {classSession.teacher?.user?.firstName}</Typography>
                        <Typography variant="subtitle1"><strong>Topic:</strong> {classSession.topic?.name}</Typography>
                        <Typography variant="subtitle1"><strong>Start Time:</strong> {moment(classSession.sessionStartDate).format('LLL')}</Typography>
                        <Typography variant="subtitle1"><strong>End Time:</strong> {moment(classSession.sessionEndDate).format('LLL')}</Typography>
                        <Typography variant="subtitle1"><strong>Students Enrolled:</strong></Typography>
                        {classSession.students?.length > 0 ? (
                            classSession.students.map((student: any) => (
                                <Typography key={student.id} variant="body2">- {student.user.firstName}</Typography>
                            ))
                        ) : (
                            <Typography variant="body2">No students enrolled.</Typography>
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
