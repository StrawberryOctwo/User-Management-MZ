import React from 'react';
import { Card, CardContent, Typography, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';

interface StudentDetailCardProps {
    student: any; // Define more precise types based on your data model
    reportCompleted: boolean; // Add this to track if the report is completed
    onAddReport: () => void;
    onViewReport: () => void;
}

const StudentDetailCard: React.FC<StudentDetailCardProps> = ({ student, reportCompleted, onAddReport, onViewReport }) => {
    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="subtitle1">
                            <Link to={`/management/students/view/${student.id}`}>
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
                            <Button variant="contained" color="primary" onClick={onAddReport} sx={{ mr: 1 }}>
                                Add Report
                            </Button>
                        )}
                        <Button variant="contained" color="secondary" disabled sx={{ mr: 1 }}>
                            View Payment
                        </Button>
                        <IconButton>
                            <CircleIcon sx={{ color: reportCompleted ? 'green' : 'red' }} />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default StudentDetailCard;
