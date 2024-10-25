import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { fetchTeacherById, fetchTeacherDocumentsById } from 'src/services/teacherService';
import ReusableDetails from 'src/components/View';
import FileActions from 'src/components/Files/FileActions';
import { getPaymentsForUser } from 'src/services/paymentService.';

const ViewTeacherPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [teacher, setTeacher] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);

    const loadTeacher = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const teacherData = await fetchTeacherById(Number(id));
            setTeacher(teacherData);

            const teacherDocuments = await fetchTeacherDocumentsById(Number(id));
            setDocuments(teacherDocuments.documents);

            const userPayments = await getPaymentsForUser(teacherData.user?.id);
            setPayments(userPayments);
        } catch (error: any) {
            console.error('Failed to fetch teacher:', error);
            setErrorMessage(t('failed_to_fetch_teacher'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadTeacher();
        }
    }, [id, t]);

    const formattedContractStartDate = teacher ? format(new Date(teacher.contractStartDate), 'PP') : '';
    const formattedContractEndDate = teacher ? format(new Date(teacher.contractEndDate), 'PP') : '';
    const formattedDob = teacher ? format(new Date(teacher.user.dob), 'PP') : '';

    // Define fields for the ReusableDetails component
    const Fields = [
        { name: 'user.firstName', label: t('first_name'), section: t('user_details') },
        { name: 'user.lastName', label: t('last_name'), section: t('user_details') },
        { name: 'user.dob', label: t('dob'), section: t('user_details') },
        { name: 'user.email', label: t('email'), section: t('user_details') },
        { name: 'user.address', label: t('address'), section: t('user_details') },
        { name: 'user.postalCode', label: t('postal_code'), section: t('user_details') },
        { name: 'user.phoneNumber', label: t('phone_Number'), section: t('user_details') },
        { name: 'employeeNumber', label: t('employee_number'), section: t('teacher_details') },
        { name: 'idNumber', label: t('id_number'), section: t('teacher_details') },
        { name: 'taxNumber', label: t('tax_number'), section: t('teacher_details') },
        { name: 'contractStartDate', label: t('contract_start_date'), section: t('teacher_details') },
        { name: 'contractEndDate', label: t('contract_end_date'), section: t('teacher_details') },
        { name: 'hourlyRate', label: t('hourly_rate'), section: t('teacher_details') },
        { name: 'bank', label: t('bank'), section: t('teacher_details') },
        { name: 'iban', label: t('iban'), section: t('teacher_details') },
        { name: 'bic', label: t('bic'), section: t('teacher_details') },
        {
            name: 'topics',
            label: t('topics'),
            section: t('topics'),
            isCustom: true,
            component: (data: any) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, ml: 1 }}>
                    {data?.topics?.length > 0 ? (
                        data.topics.map((topic: { name: string }, index: number) => (
                            <Typography key={index} variant="body1" sx={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0f7fa', borderRadius: '4px' }}>
                                {topic.name}
                            </Typography>
                        ))
                    ) : (
                        <Typography variant="body1" sx={{ padding: '0.25rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                            {t('None')}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            name: 'locations',
            label: t('locations'),
            section: t('locations'),
            isArray: true,
            columns: [
                { field: 'name', headerName: t('location_name'), flex: 1 },
                { field: 'franchise.name', headerName: t('franchise_name'), flex: 1 },
                { field: 'address', headerName: t('address'), flex: 1 },
                { field: 'postalCode', headerName: t('postal_code'), flex: 1 },
                { field: 'created_at', headerName: t('created_date'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any } }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/locations/view/${params.row.id}`, '_blank')}
                        >
                            {t('view_details')}
                        </Button>
                    ),
                    sortable: false,
                    width: 150,
                },
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
                    renderCell: (params: { row: { id: any, name: string, path: string } }) => (
                        <FileActions fileId={params.row.id} fileName={params.row.name} />
                    ),
                    sortable: false,
                    width: 200,
                },
            ],
        },
    ];

    // Transform data to support nested field access
    const transformedData = {
        ...teacher,
        payments,
        'user.firstName': teacher?.user?.firstName,
        'user.lastName': teacher?.user?.lastName,
        'user.dob': formattedDob,
        'user.email': teacher?.user?.email,
        'user.address': teacher?.user?.address,
        'user.postalCode': teacher?.user?.postalCode,
        'user.phoneNumber': teacher?.user?.phoneNumber,
        'contractStartDate': formattedContractStartDate,
        'contractEndDate': formattedContractEndDate,
        'locations': teacher?.locations.map((location: any) => ({
            ...location,
            'franchise.name': location?.franchise?.name,
            created_at: location.created_at ? format(new Date(location.created_at), 'dd-MM-yyyy') : '',
        })),
        'classSessions': teacher?.classSessions.map((classSession: any) => ({
            ...classSession,
            location_name: classSession.location.name,
            topic_name: classSession.topic.name,
            created_at: classSession.created_at ? format(new Date(classSession.created_at), 'dd-MM-yyyy') : '',
        })),
        'topics': teacher?.topics,
        'documents': documents,
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : (
                teacher && (
                    <ReusableDetails
                        fields={Fields}
                        data={transformedData}
                        entityName={`${teacher.user.firstName} ${teacher.user.lastName}'s`}
                    />
                )
            )}
        </Box>
    );
};

export default ViewTeacherPage;
