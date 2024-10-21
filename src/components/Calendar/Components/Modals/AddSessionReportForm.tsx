import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Box } from '@mui/material';
import { addSessionReport } from 'src/services/sessionReportService';  // Import the add report service

interface AddSessionReportFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newReport: any) => void;
    studentName: string;
    classSessionId: string;  // Include the session ID to attach the report to
    studentId: string;  // Include the student ID for whom the report is being created
}

const AddSessionReportForm: React.FC<AddSessionReportFormProps> = ({ isOpen, onClose, onSave, studentName, classSessionId, studentId }) => {
    const [reportType, setReportType] = useState<string>('');
    const [comments, setComments] = useState<string>('');

    // Reset form fields when the dialog is opened or closed
    useEffect(() => {
        if (!isOpen) {
            setReportType('');
            setComments('');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (reportType && comments) {
            try {
                const newReport = await addSessionReport({
                    reportType,
                    comments,
                    classSessionId,
                    studentId,
                });
                onSave(newReport);  // Pass the newly created report to the parent
                setReportType('');  // Reset the form fields
                setComments('');
                onClose();  // Close the dialog
            } catch (error) {
                console.error('Error saving session report:', error);
            }
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Session Report for {studentName}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                        label="Report Type"
                        select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        fullWidth
                        required
                    >
                        <MenuItem value="Attendance">Attendance</MenuItem>
                        <MenuItem value="Performance">Performance</MenuItem>
                        <MenuItem value="Behavior">Behavior</MenuItem>
                    </TextField>

                    <TextField
                        label="Comments"
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
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained">
                    Save Report
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSessionReportForm;
