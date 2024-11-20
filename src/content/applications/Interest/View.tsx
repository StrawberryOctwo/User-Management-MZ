import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchInterestById } from 'src/services/interestService';
import ReusableDetails from 'src/components/View';
import { de } from 'date-fns/locale';

const ViewInterest: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [interest, setInterest] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadInterest = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const interestData = await fetchInterestById(Number(id));
            interestData.data.location = interestData.data.location.name; 
            interestData.data.accepted = interestData.data.accepted ? t('yes') : t('no')
            interestData.data.takeKnowledgeTest = interestData.data.takeKnowledgeTest ? t('yes') : t('no'); 
            setInterest(interestData);

        } catch (error: any) {
            console.error('Failed to fetch interest:', error);
            setErrorMessage(t('failed_to_fetch_interest'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadInterest();
        }
    }, [id, t]);

        const formattedAppointment = interest?.data?.appointment
        ? format(new Date(interest.data.appointment), 'PPpp', { locale: de }) // 'PPpp' includes date and time
        : t('not_available');

    const formattedCreatedAt = interest?.data?.createdAt
        ? format(new Date(interest.data.createdAt), 'PPpp', { locale: de }) // 'PPpp' includes date and time
        : t('not_available');
    const Fields = [
        { name: 'firstName', label: t('first_name'), section: t('interest_details') },
        { name: 'lastName', label: t('last_name'), section: t('interest_details') },
        { name: 'email', label: t('email'), section: t('interest_details') },
        { name: 'phoneNumber', label: t('phone_number'), section: t('interest_details') },
        { name: 'role', label: t('role'), section: t('interest_details') },
        { name: 'accepted', label: t('accepted'), section: t('interest_details')},
        { name: 'fundingOption', label: t('funding_option'), section: t('interest_details') },
        { name: 'takeKnowledgeTest', label: t('knowledge_test'), section: t('interest_details') },
        { name: 'appointment', label: t('appointment'), section: t('interest_details') },
        { name: 'createdAt', label: t('created_date'), section: t('interest_details') },
        {
            name: 'location',
            label: t('location'),
            section: t('location_details'),
      
          },
    ];

    const transformedData = {
        ...interest?.data,
        appointment: formattedAppointment,
        createdAt: formattedCreatedAt,
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
            {loading ? (
                <Typography variant="h6">{t('loading')}</Typography>
            ) : errorMessage ? (
                <Typography variant="h6" color="error">{errorMessage}</Typography>
            ) : interest ? (
                <ReusableDetails
                    fields={Fields}
                    data={transformedData}
                    entityName={`${interest.data.firstName} ${interest.data.lastName}`}
                />
            ) : (
                <Typography variant="h6">{t('no_interest_data_available')}</Typography>
            )}
        </Box>
    );
};

export default ViewInterest;

