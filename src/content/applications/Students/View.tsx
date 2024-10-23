import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { t } from 'i18next'; // Import the translation hook
import { format } from 'date-fns';
import { fetchStudentById, fetchStudentDocumentsById } from 'src/services/studentService';
import ReusableDetails from 'src/components/View';
import FileActions from 'src/components/Files/FileActions';
import { getSessionReportsForStudent } from 'src/services/sessionReportService';
import { getPaymentsForUser } from 'src/services/paymentService.';

const ViewStudentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state for the page
    const [documents, setDocuments] = useState<any[]>([]);
    const [sessionReports, setSessionReports] = useState<any[]>([]); // Store session reports
    const [payments, setPayments] = useState<any[]>([]); // Store payments

    // Function to load the student and associated data
    const loadStudentData = async () => {
        setLoading(true);
        setErrorMessage(null); // Clear previous errors

        try {
            const studentData = await fetchStudentById(Number(id));
            setStudent(studentData);

            const studentDocuments = await fetchStudentDocumentsById(Number(id));
            setDocuments(studentDocuments.documents);

            const reports = await getSessionReportsForStudent(id);
            setSessionReports(reports);

            const userPayments = await getPaymentsForUser(studentData.user.id);
            setPayments(userPayments);
        } catch (error: any) {
            console.error('Failed to fetch student data:', error);
            setErrorMessage(t('failed_to_fetch_student')); // Set error message for retry mechanism
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadStudentData(); // Fetch student data on component mount
        }
    }, [id, t]);

    const formattedCreatedAt = student ? format(new Date(student.created_at), 'PPpp') : '';
    const formattedContractEndDate = student ? format(new Date(student.contractEndDate), 'yyyy-MM-dd') : '';
    const formattedDob = student ? format(new Date(student.user.dob), 'yyyy-MM-dd') : '';

    // Define fields for the ReusableDetails component
    const Fields = [
        { name: 'user.firstName', label: t('first_name'), section: t('user_details') },
        { name: 'user.lastName', label: t('last_name'), section: t('user_details') },
        { name: 'user.dob', label: t('dob'), section: t('user_details') },
        { name: 'user.email', label: t('email'), section: t('user_details') },
        { name: 'user.address', label: t('address'), section: t('user_details') },
        { name: 'user.postalCode', label: t('postal_code'), section: t('user_details') },
        { name: 'user.phoneNumber', label: t('phone_Number'), section: t('user_details') },
        { name: 'payPerHour', label: t('pay_per_hour'), section: t('student_details') },
        { name: 'status', label: t('status'), section: t('student_details') },
        { name: 'gradeLevel', label: t('grade_level'), section: t('student_details') },
        { name: 'contractType', label: t('contract_type'), section: t('student_details') },
        { name: 'contractEndDate', label: t('contract_end_date'), section: t('student_details') },
        { name: 'notes', label: t('notes'), section: t('student_details') },
        { name: 'availableDates', label: t('available_dates'), section: t('student_details') },
        { name: 'created_at', label: t('created_date'), section: t('student_details') },
        {
            name: 'sessionReports',
            label: t('session_reports'),
            section: t('session_reports'),
            isArray: true,
            columns: [
                { field: 'report_type', headerName: t('report_type') },
                { field: 'comments', headerName: t('comments') },
                { field: 'session_date', headerName: t('session_date'), format: 'yyyy-MM-dd' },
            ],
        },
        {
            name: 'payments',
            label: t('payments'),
            section: t('payments_section'),
            isArray: true,
            columns: [
                { field: 'amount', headerName: t('amount') },
                { field: 'paymentStatus', headerName: t('status') },
                { field: 'paymentDate', headerName: t('date'), format: 'yyyy-MM-dd' },
            ],
        },
        {
            name: 'documents',
            label: t('documents'),
            section: t('documents'),
            isArray: true, // Treat documents as an array
            columns: [
                { field: 'name', headerName: t('name'), flex: 1 },
                { field: 'type', headerName: t('type'), flex: 1 },
                { field: 'path', headerName: t('path'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any; name: string } }) => (
                        <FileActions fileId={params.row.id} fileName={params.row.name} />
                    ),
                    sortable: false,
                    width: 200,
                },
            ],
        },
    ];

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : student ? (
                <>
                    <ReusableDetails
                        fields={Fields}
                        data={student}
                        entityName={`${student.user.firstName} ${student.user.lastName}`}
                    />
                </>
            ) : (
                <Typography variant="h6">{t('no_student_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewStudentPage;
