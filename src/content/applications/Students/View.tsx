import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { t } from 'i18next';
import {
  fetchStudentById,
  fetchStudentDocumentsById
} from 'src/services/studentService';
import { getSessionReportsForStudent } from 'src/services/sessionReportService';
import ReusableDetails from 'src/components/View';
import FileActions from 'src/components/Files/FileActions';
import {
  getPaymentsForUser,
  updatePaymentStatus
} from 'src/services/paymentService';
import ViewSessionReportForm from 'src/components/Calendar/Components/Modals/ViewSessionReport';
import {
  capitalizeFirstLetter,
  decodeAvailableDates,
  formatDate
} from './utils';

const ViewStudentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [sessionReports, setSessionReports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Function to load the student and associated data
  const loadStudentData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const studentData = await fetchStudentById(Number(id));

      // Transform availableDates: Binary to Array of Day Names
      studentData.availableDates = decodeAvailableDates(
        studentData.availableDates
      ).map(capitalizeFirstLetter);

      // Transform locations: Array of Objects to Array of Names
      if (studentData.locations && Array.isArray(studentData.locations)) {
        studentData.locations = studentData.locations.map((location: any) => location.name);
      }

      // Format Dates
      studentData.contractEndDate = formatDate(studentData.contractEndDate);
      studentData.createdAt = formatDate(studentData.createdAt);
      studentData.user.dob = formatDate(studentData.user.dob);

      setStudent(studentData);

      const studentDocuments = await fetchStudentDocumentsById(Number(id));
      setDocuments(studentDocuments.documents);

      const reports = await getSessionReportsForStudent(id);
      setSessionReports(reports);

      const userPayments = await getPaymentsForUser(studentData.user?.id);
      setPayments(userPayments.data);
    } catch (error: any) {
      console.error('Failed to fetch student data:', error);
      setErrorMessage(t('failed_to_fetch_student'));
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (paymentId: number, newStatus: string) => {
    setPayments((prevPayments) =>
      prevPayments.map((payment) =>
        payment.id === paymentId
          ? { ...payment, paymentStatus: newStatus }
          : payment
      )
    );

    try {
      await updatePaymentStatus(paymentId, newStatus); // Call API to confirm update
    } catch (error) {
      console.error('Failed to update payment status:', error);
      loadStudentData();
    }
  };

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const flattenedData = {
    ...student,
    sessionReports,
    documents,
    payments,
    sessionBalance: student?.sessionBalance,
    firstName: student?.user?.firstName || '',
    lastName: student?.user?.lastName || '',
    dob: student?.user?.dob || '',
    email: student?.user?.email || '',
    city: student?.user?.city || '',
    address: student?.user?.address || '',
    postalCode: student?.user?.postalCode || '',
    phoneNumber: student?.user?.phoneNumber || '',
    contractType: student?.contract?.name
  };

  // Ensure the user data is fetched correctly
  const user = student?.user || {}; // Use a default empty object if user is undefined

  // Open the session report dialog
  const openReportDialog = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsReportDialogOpen(true);
  };

  // Close the session report dialog and reload data if needed
  const closeReportDialog = () => {
    setIsReportDialogOpen(false);
    setSelectedReportId(null);
    // loadStudentData();
  };

  const Fields = [
    { name: 'firstName', label: t('first_name'), section: t('user_details') },
    { name: 'lastName', label: t('last_name'), section: t('user_details') },
    { name: 'dob', label: t('dob'), section: t('user_details') },
    { name: 'email', label: t('email'), section: t('user_details') },
    { name: 'city', label: t('city'), section: t('user_details') },
    { name: 'address', label: t('address'), section: t('user_details') },
    { name: 'postalCode', label: t('postal_code'), section: t('user_details') },
    {
      name: 'phoneNumber',
      label: t('phone_number'),
      section: t('user_details')
    },
    { name: 'status', label: t('status'), section: t('student_details') },
    {
      name: 'gradeLevel',
      label: t('grade_level'),
      section: t('student_details')
    },
    {
      name: 'contractType',
      label: t('contract_type'),
      section: t('student_details')
    },
    {
      name: 'sessionBalance',
      label: t('session_balance'),
      section: t('student_details')
    },
    {
      name: 'contractEndDate',
      label: t('contract_end_date'),
      section: t('student_details')
    },
    { name: 'notes', label: t('notes'), section: t('student_details') },
    {
      name: 'availableDates',
      label: t('available_dates'),
      section: t('student_details'),
      isArray: true,
      isTextArray: true // Display available dates as comma-separated
    },
    {
      name: 'createdAt',
      label: t('created_date'),
      section: t('student_details')
    },
    {
      name: 'locations',
      label: t('locations'),
      section: t('student_details'),
      isArray: true,
      isTextArray: true // Display locations as comma-separated text
    },
    {
      name: 'sessionReports',
      label: t('session_reports'),
      section: t('session_reports'),
      isArray: true,
      columns: [
        { field: 'lessonTopic', headerName: t('lesson_topic'), flex: 1 },
        {
          field: 'activeParticipation',
          headerName: t('active_participation'),
          flex: 1
        },
        { field: 'tutorRemarks', headerName: t('tutor_remarks'), flex: 1 },
        {
          field: 'actions',
          headerName: t('actions'),
          renderCell: (params: { row: { id: string } }) => (
            <Button
              variant="contained"
              color="primary"
              onClick={() => openReportDialog(params.row.id)}
            >
              {t('view_report')}
            </Button>
          ),
          sortable: false,
          width: 150
        }
      ]
    },
    {
      name: 'payments',
      label: t('payments'),
      section: t('payments_section'),
      isArray: true,
      columns: [
        { field: 'amount', headerName: t('amount'), flex: 1 },
        {
          field: 'paymentDate',
          headerName: t('payment_date'),
          flex: 1,
          render: (value: any) =>
            new Date(value).toLocaleDateString(undefined, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
        },
        {
          field: 'paymentStatus',
          headerName: t('payment_status'),
          renderCell: (params: {
            row: { id: number; paymentStatus: string };
          }) => (
            <Select
              value={params.row.paymentStatus}
              onChange={(e) =>
                handleUpdateStatus(params.row.id, e.target.value)
              }
              fullWidth
              sx={{ height: 40 }}
            >
              <MenuItem value="Pending">{t('pending')}</MenuItem>
              <MenuItem value="Paid">{t('paid')}</MenuItem>
              <MenuItem value="Cancelled">{t('cancelled')}</MenuItem>
            </Select>
          ),
          sortable: false,
          width: 180
        }
      ]
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
          width: 200
        }
      ]
    }
  ];

  return (
    <Box sx={{ position: 'relative', padding: 4 }}>
      {loading ? (
        <Typography variant="h6">{t('loading')}</Typography>
      ) : errorMessage ? (
        <Typography variant="h6" color="error">
          {errorMessage}
        </Typography>
      ) : student ? (
        <ReusableDetails
          fields={Fields}
          data={flattenedData}
          entityName={`${user.firstName || ''} ${user.lastName || ''}`}
        />
      ) : (
        <Typography variant="h6">{t('no_student_data_available')}</Typography>
      )}
      {/* View Session Report Dialog */}
      {selectedReportId && (
        <ViewSessionReportForm
          isOpen={isReportDialogOpen}
          reportId={selectedReportId}
          onClose={closeReportDialog}
          onDelete={closeReportDialog}
        />
      )}
    </Box>
  );
};

export default ViewStudentPage;
