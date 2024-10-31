import React from 'react';
import { Card, Typography, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';

interface StudentDetailCardProps {
    student: any; // Define more precise types based on your data model
    reportCompleted: boolean; // Track if the report is completed
    onAddReport: () => void;
    onViewReport: () => void;
    onViewPayment: () => void;
    handleAbsence: () => void;
    canAddReport: boolean;
    classSessionId: number; // Add the class session ID as a prop
}

const StudentDetailCard: React.FC<StudentDetailCardProps> = ({
    student,
    reportCompleted,
    onAddReport,
    onViewReport,
    onViewPayment,
    handleAbsence,
    canAddReport,
    classSessionId
}) => {
    // Find the absence related to the specific class session
    const sessionAbsence = student.absences?.find((absence: any) => absence.classSession.id === classSessionId) || null;
    const absenceLabel = sessionAbsence ? (sessionAbsence.status ? 'Absent' : 'Present') : 'Present';

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

                    <Button
                        variant="outlined"
                        color={absenceLabel == 'Absent' ? "error" : "success"}
                        onClick={handleAbsence}
                        sx={{ mr: 1 }}
                    >
                        {absenceLabel}
                    </Button>

                    {reportCompleted ? (
                        <Button variant="outlined" color="primary" onClick={onViewReport} sx={{ mr: 1 }}>
                            View Report
                        </Button>
                    ) : (
                        !canAddReport && (
                            <Button variant="outlined" color="primary" onClick={onAddReport} sx={{ mr: 1 }}>
                                Add Report
                            </Button>
                        )
                    )}
                    {/* Enable View Payment button if report is completed */}
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onViewPayment}
                        disabled={!reportCompleted}
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
