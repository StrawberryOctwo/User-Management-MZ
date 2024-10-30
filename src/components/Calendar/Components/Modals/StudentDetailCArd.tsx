import React from 'react';
import { Card, CardContent, Typography, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';

interface StudentDetailCardProps {
    student: any; // Define more precise types based on your data model
    reportCompleted: boolean; // Track if the report is completed
    onAddReport: () => void;
    onViewReport: () => void;
    onViewPayment: () => void;  // Add handler to view payment
    canAddReport: boolean;
}

const StudentDetailCard: React.FC<StudentDetailCardProps> = ({
    student,
    reportCompleted,
    onAddReport,
    onViewReport,
    onViewPayment,
    canAddReport
}) => {
    return (
        <Card variant="outlined" sx={{ mb: 2, mt: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" padding={1.5}>
                <Box>
                    <Typography variant="subtitle1">
                        <Link to={`/management/students/view/${student.id}`} style={{ textDecoration: 'none' }} title="View student details">
                            {student.user.firstName} {student.user.lastName}
                        </Link>
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    {/* If report is completed, show View Report, else show Add Report */}
                    {reportCompleted ? (
                        <Button variant="contained" color="primary" onClick={onViewReport} sx={{ mr: 1 }}>
                            View Report
                        </Button>
                    ) : (
                        !canAddReport && (
                            <Button variant="contained" color="primary" onClick={onAddReport} sx={{ mr: 1 }}>
                                Add Report
                            </Button>
                        )
                    )}
                    {/* Enable View Payment button if report is completed */}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={onViewPayment}  // Trigger view payment handler
                        disabled={!reportCompleted}  // Enable only if report is completed
                        sx={{ mr: 1 }}
                    >
                        View Payment
                    </Button>
                    <IconButton disabled={true}>
                        <CircleIcon sx={{ color: reportCompleted ? 'green' : 'red' }} />
                    </IconButton>
                </Box>
            </Box>
        </Card>
    );
};

export default StudentDetailCard;
