import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, CircularProgress } from '@mui/material';
import { getSessionReportById, updateSessionReport, deleteSessionReport } from 'src/services/sessionReportService';  // Ensure the services are imported

interface ViewSessionReportFormProps {
    isOpen: boolean;
    reportId: string;
    onClose: () => void;
    onDelete: () => void;  // Remove refresh logic here
    student: any;
    classSessionId: string;
}

const ViewSessionReportForm: React.FC<ViewSessionReportFormProps> = ({
    isOpen,
    onClose,
    reportId,
    onDelete,
    student,
    classSessionId,
}) => {
    const [reportType, setReportType] = useState<string>('');
    const [comments, setComments] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);  // Track loading state for the form data

    // Fetch the session report when the dialog opens
    useEffect(() => {
        if (isOpen && reportId) {
            const fetchReport = async () => {
                setLoading(true);
                try {
                    const report = await getSessionReportById(reportId);  // Fetch the report by ID
                    setReportType(report.reportType);  // Set fetched report type
                    setComments(report.comments);      // Set fetched comments
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
            setReportType('');
            setComments('');
        }
    }, [isOpen]);

    const handleSave = async () => {
        try {
            await updateSessionReport(reportId, { reportType, comments });
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
            <DialogTitle>View/Edit Session Report for {student?.user?.firstName} {student?.user?.lastName}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={2}>
                        <CircularProgress />
                    </Box>
                ) : (
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
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete} color="secondary">
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
