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
    ];

    // Table for session reports
    const renderSessionReportsTable = () => (
        <Box mt={4}>
            <Typography variant="h6">{t('session_reports')}</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('report_type')}</TableCell>
                            <TableCell>{t('comments')}</TableCell>
                            <TableCell>{t('session_date')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sessionReports ? (
                            sessionReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>{report.reportType}</TableCell>
                                    <TableCell>{report.comments}</TableCell>
                                    <TableCell>{format(new Date(report.session.sessionStartDate), 'yyyy-MM-dd')}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3}>{t('no_reports_available')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // Table for payments
    const renderPaymentsTable = () => (
        <Box mt={4}>
            <Typography variant="h6">{t('payments')}</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Amount')}</TableCell>
                            <TableCell>{t('Status')}</TableCell>
                            <TableCell>{t('Date')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.amount}</TableCell>
                                    <TableCell>{payment.paymentStatus}</TableCell>
                                    <TableCell>{format(new Date(payment.paymentDate), 'yyyy-MM-dd')}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3}>{t('no_payments_available')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // Table for documents
    const renderDocumentsTable = () => (
        <Box mt={4}>
            <Typography variant="h6">{t('documents')}</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Name')}</TableCell>
                            <TableCell>{t('Type')}</TableCell>
                            <TableCell>{t('Actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>{doc.name}</TableCell>
                                    <TableCell>{doc.type}</TableCell>
                                    <TableCell>
                                        <FileActions fileId={doc.id} fileName={doc.name} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3}>{t('no_documents_available')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

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
                    {renderSessionReportsTable()}
                    {renderPaymentsTable()}
                    {renderDocumentsTable()}
                </>
            ) : (
                <Typography variant="h6">{t('no_student_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewStudentPage;
