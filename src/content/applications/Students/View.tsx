import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [sessionReports, setSessionReports] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);

    // Function to load the student and associated data
    const loadStudentData = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const studentData = await fetchStudentById(Number(id));
            setStudent(studentData);

            const studentDocuments = await fetchStudentDocumentsById(Number(id));
            setDocuments(studentDocuments.documents);

            const reports = await getSessionReportsForStudent(id);
            setSessionReports(reports);

            const userPayments = await getPaymentsForUser(studentData.user?.id);
            setPayments(userPayments);
        } catch (error: any) {
            console.error('Failed to fetch student data:', error);
            setErrorMessage(t('failed_to_fetch_student'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadStudentData();
        }
    }, [id]);
    const flattenedData = {
        ...student, // Spread original student data
        sessionReports, // Include sessionReports
        documents, // Include documents
        payments, // Include payments
        firstName: student?.user?.firstName || '', // Flatten user fields
        lastName: student?.user?.lastName || '',
        dob: student?.user?.dob || '',
        email: student?.user?.email || '',
        address: student?.user?.address || '',
        postalCode: student?.user?.postalCode || '',
        phoneNumber: student?.user?.phoneNumber || '',
    };


    // Ensure the user data is fetched correctly
    const user = student?.user || {}; // Use a default empty object if user is undefined
    // Define fields for ReusableDetails
    const Fields = [
        { name: 'firstName', label: t('first_name'), section: t('user_details') },
        { name: 'lastName', label: t('last_name'), section: t('user_details') },
        { name: 'dob', label: t('dob'), section: t('user_details') },
        { name: 'email', label: t('email'), section: t('user_details') },
        { name: 'address', label: t('address'), section: t('user_details') },
        { name: 'postalCode', label: t('postal_code'), section: t('user_details') },
        { name: 'phoneNumber', label: t('phone_number'), section: t('user_details') },
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
                { field: 'lessonTopic', headerName: t('lesson_topic'), flex: 1 },
                { field: 'activeParticipation', headerName: t('active_participation'), flex: 1 },
                { field: 'tutorRemarks', headerName: t('tutor_remarks'), flex: 1 },
            ],
        },
        {
            name: 'payments',
            label: t('payments'),
            section: t('payments_section'),
            isArray: true,
            columns: [
                { field: 'amount', headerName: t('amount'), flex: 1 },
                { field: 'paymentStatus', headerName: t('status'), flex: 1 },
                { field: 'paymentDate', headerName: t('date'), format: 'yyyy-MM-dd', flex: 1 },
            ],
        },
        {
            name: 'documents',
            label: t('documents'),
            section: t('documents'),
            isArray: true,
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
                <ReusableDetails
                    fields={Fields}
                    data={flattenedData}
                    entityName={`${user.firstName || ''} ${user.lastName || ''}`}
                />
            ) : (
                <Typography variant="h6">{t('no_student_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewStudentPage;
