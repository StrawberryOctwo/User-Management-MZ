import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { format } from 'date-fns';
import {
  fetchInterestById,
  toggleAcceptedStatus
} from 'src/services/interestService';
import ReusableDetails from 'src/components/View';
import { de } from 'date-fns/locale';
import { base64ToBlob } from 'src/utils/utils';
import { useTranslation } from 'react-i18next';

const ViewInterest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [interest, setInterest] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const loadInterest = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const interestData = await fetchInterestById(Number(id));
      interestData.data.location = interestData.data.location.name;
      
      setInterest(interestData);
    } catch (error: any) {
      console.error('Failed to fetch interest:', error);
      setErrorMessage(t('failed_to_fetch_interest'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccepted = async () => {
    if (!interest || !interest.data) return;

    setUpdating(true);
    try {
      const updatedInterest = await toggleAcceptedStatus(interest.data.id);
      setInterest({
        ...interest,
        data: {
          ...interest.data,
          accepted: updatedInterest.data.accepted // Keep it as boolean
        }
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      setErrorMessage(t('failed_to_update_status'));
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadInterest();
    }
  }, [id]);

  const formattedAppointment = interest?.data?.appointment
    ? format(new Date(interest.data.appointment), 'PPpp', { locale: de })
    : t('not_available');

  const formattedCreatedAt = interest?.data?.createdAt
    ? format(new Date(interest.data.createdAt), 'PPpp', { locale: de })
    : t('not_available');

  // Create document fields using 'component' instead of 'value'
  const documentFields = {
    name: 'documents',
    label: t('documents'),
    section: t('documents'),
    isArray: true,
    isTable: true,
    columns: [
      { field: 'name', headerName: t('name'), flex: 1 },
      {
        field: 'actions',
        headerName: t('actions'),
        renderCell: (params: any) => {
          const { row } = params;
          const { base64, name } = row;

          if (!base64) {
            return <Typography variant="body2">N/A</Typography>;
          }

          const mimeType = base64.split(';')[0].split(':')[1];
          const blob = base64ToBlob(base64, mimeType);
          const url = URL.createObjectURL(blob);

          const handleView = () => {
            window.open(url, '_blank', 'noopener,noreferrer');
            // Note: Do not revoke the URL here if the user is viewing it in a new tab
          };

          const handleDownload = () => {
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Revoke after download
          };

          return (
            <Box>
              <Button
                onClick={handleView}
                variant="contained"
                size="small"
                sx={{ mr: 1 }}
              >
                {t('view')}
              </Button>
              <Button onClick={handleDownload} variant="outlined" size="small">
                {t('download')}
              </Button>
            </Box>
          );
        },
        sortable: false,
        width: 200
      }
    ]
  };

  const Fields = [
    {
      name: 'firstName',
      label: t('first_name'),
      section: t('interest_details')
    },
    { name: 'lastName', label: t('last_name'), section: t('interest_details') },
    { name: 'email', label: t('email'), section: t('interest_details') },
    {
      name: 'phoneNumber',
      label: t('phone_number'),
      section: t('interest_details')
    },
    { name: 'role', label: t('role'), section: t('interest_details') },
    {
      name: 'accepted',
      label: t('accepted'),
      section: t('interest_details'),
      render: () => interest?.data?.accepted ? "yes" : "no", 
    },
    {
      name: 'fundingOption',
      label: t('funding_option'),
      section: t('interest_details')
    },
    {
      name: 'takeKnowledgeTest',
      label: t('knowledge_test'),
      section: t('interest_details')
    },
    {
      name: 'appointment',
      label: t('appointment'),
      section: t('interest_details')
    },
    {
      name: 'createdAt',
      label: t('created_date'),
      section: t('interest_details')
    },
    { name: 'location', label: t('location'), section: t('location_details') },
    documentFields // Spread documentFields here
  ];

  const transformedData = {
    ...interest?.data,
    appointment: formattedAppointment,
    createdAt: formattedCreatedAt
  };

  return (
    <Box sx={{ position: 'relative', padding: 4 }}>
      {loading ? (
        <Typography variant="h6">{t('loading')}</Typography>
      ) : errorMessage ? (
        <Typography variant="h6" color="error">
          {errorMessage}
        </Typography>
      ) : interest ? (
        <Stack spacing={3}>
          <ReusableDetails
            fields={Fields}
            data={transformedData}
            entityName={`${interest.data.firstName} ${interest.data.lastName}`} // Correct template literal
          />
          <Box textAlign="center">
            <Button
              variant="contained"
              color={interest.data.accepted ? 'error' : 'primary'} // Boolean check
              onClick={handleToggleAccepted}
              disabled={updating}
              sx={{ textTransform: 'capitalize', fontSize: '16px', px: 4 }}
            >
              {updating
                ? t('processing')
                : interest.data.accepted
                ? t('decline_user')
                : t('accept_user')}
            </Button>
          </Box>
        </Stack>
      ) : (
        <Typography variant="h6">{t('no_interest_data_available')}</Typography>
      )}
    </Box>
  );
};

export default ViewInterest;
