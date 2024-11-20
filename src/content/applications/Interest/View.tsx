import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { t } from 'i18next';
import { format } from 'date-fns';
import { fetchInterestById, toggleAcceptedStatus } from 'src/services/interestService';
import ReusableDetails from 'src/components/View';
import { de } from 'date-fns/locale';

const ViewInterest: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [interest, setInterest] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                    accepted: updatedInterest.data.accepted ? 'yes' : 'no',
                },
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

    const Fields = [
        { name: 'firstName', label: t('first_name'), section: t('interest_details') },
        { name: 'lastName', label: t('last_name'), section: t('interest_details') },
        { name: 'email', label: t('email'), section: t('interest_details') },
        { name: 'phoneNumber', label: t('phone_number'), section: t('interest_details') },
        { name: 'role', label: t('role'), section: t('interest_details') },
        {
            name: 'accepted',
            label: t('accepted'),
            section: t('interest_details'),
            value: (
                <Chip
                    label={interest?.data.accepted === 'yes' ? t('accepted') : t('not_accepted')}
                    color={interest?.data.accepted === 'yes' ? 'success' : 'default'}
                    sx={{ fontSize: '14px', fontWeight: 'bold' }}
                />
            ),
        },
        { name: 'fundingOption', label: t('funding_option'), section: t('interest_details') },
        { name: 'takeKnowledgeTest', label: t('knowledge_test'), section: t('interest_details') },
        { name: 'appointment', label: t('appointment'), section: t('interest_details') },
        { name: 'createdAt', label: t('created_date'), section: t('interest_details') },
        { name: 'location', label: t('location'), section: t('location_details') },
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
                <Typography variant="h6" color="error">
                    {errorMessage}
                </Typography>
            ) : interest ? (
                <Stack spacing={3}>
                    <ReusableDetails
                        fields={Fields}
                        data={transformedData}
                        entityName={`${interest.data.firstName} ${interest.data.lastName}`}
                    />
                    <Box textAlign="center">
                        <Button
                            variant="contained"
                            color={interest.data.accepted === 'yes' ? 'error' : 'primary'}
                            onClick={handleToggleAccepted}
                            disabled={updating}
                            sx={{ textTransform: 'capitalize', fontSize: '16px', px: 4 }}
                        >
                            {updating
                                ? t('processing')
                                : interest.data.accepted === 'yes'
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
