import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next'; // Import the translation hook
import { format } from 'date-fns';
import { fetchStudentById, fetchStudentDocumentsById } from 'src/services/studentService';
import ReusableDetails from 'src/components/View';

const ViewStudentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state for the page
    const [documents, setDocuments] = useState<any[]>([]);

    // Function to load the student by ID
    const loadStudent = async () => {
        setLoading(true);
        setErrorMessage(null); // Clear previous errors

        try {
            const studentData = await fetchStudentById(Number(id));
            setStudent(studentData);

            const studentDocuments = await fetchStudentDocumentsById(Number(id));
            setDocuments(studentDocuments.documents);
        } catch (error: any) {
            console.error('Failed to fetch student:', error);
            setErrorMessage(t('failed_to_fetch_student')); // Set error message for retry mechanism
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadStudent(); // Fetch student data on component mount
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
        { name: 'parent.accountHolder', label: t('account_holder'), section: t('parent') },
        { name: 'parent.iban', label: t('iban'), section: t('parent') },
        { name: 'parent.bic', label: t('bic'), section: t('parent') },
        { name: 'location.name', label: t('location_name'), section: t('locations') },
        { name: 'location.address', label: t('location_address'), section: t('locations') },
        {
            name: 'topics',
            label: t('topics'),
            section: t('topics'),
            isCustom: true,
            component: (data: any) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, ml: 1 }}>
                    {data?.topics?.length > 0 ? (
                        data.topics.map((topic: { name: string }, index: number) => (
                            <Typography
                                key={index}
                                variant="body1"
                                sx={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0f7fa', borderRadius: '4px' }}
                            >
                                {topic.name}
                            </Typography>
                        ))
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{ padding: '0.25rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}
                        >
                            {t('None')}
                        </Typography>
                    )}
                </Box>
            ),
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

            ],
        },
    ];

    // Transform data to support nested field access
    const transformedData = {
        ...student,
        'user.firstName': student?.user?.firstName,
        'user.lastName': student?.user?.lastName,
        'user.dob': formattedDob, // Format date of birth
        'user.email': student?.user?.email,
        'user.address': student?.user?.address,
        'user.postalCode': student?.user?.postalCode,
        'user.phoneNumber': student?.user?.phoneNumber,
        'location.name': student?.location?.name,
        'location.address': student?.location?.address,
        'parent.accountHolder': student?.parent?.accountHolder,
        'parent.iban': student?.parent?.iban,
        'parent.bic': student?.parent?.bic,
        'contractEndDate': formattedContractEndDate, // Format contract end date
        'created_at': formattedCreatedAt, // Format created_at date
        'documents': documents,
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : student ? (
                <ReusableDetails
                    fields={Fields}
                    data={transformedData}
                    entityName={`${student.user.firstName} ${student.user.lastName}`}
                />
            ) : (
                <Typography variant="h6">{t('no_student_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewStudentPage;
