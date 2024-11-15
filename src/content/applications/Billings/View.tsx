import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next'; // Import the translation hook
import { format } from 'date-fns';
import { fetchFranchiseById } from 'src/services/franchiseService';
import ReusableDetails from 'src/components/View';

const ViewFranchisePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [franchise, setFranchise] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state for the page

    // Function to load the franchise by ID
    const loadFranchise = async () => {
        setLoading(true);

        try {
            const franchiseData = await fetchFranchiseById(Number(id));
            setFranchise(franchiseData);
        } catch (error: any) {
        
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadFranchise(); // Fetch franchise data on component mount
        }
    }, [id, t]);

    // Define fields for the ReusableDetails component
    const Fields = [
        { name: 'name', label: t('franchise_name'), section: t('general') },
        { name: 'ownerName', label: t('owner_name'), section: t('general') },
        { name: 'cardHolderName', label: t('card_holder_name'), section: t('general') },
        { name: 'iban', label: t('iban'), section: t('general') },
        { name: 'bic', label: t('bic'), section: t('general') },
        { name: 'status', label: t('status'), section: t('general') },
        { name: 'totalEmployees', label: t('total_employees'), section: t('general') },
        {
            name: 'admins',
            label: t('franchise_admins'),
            section: t('admins'),
            isArray: true, // Indicate this is an array field
            columns: [
                { field: 'firstName', headerName: t('first_name'), flex: 1 },
                { field: 'lastName', headerName: t('last_name'), flex: 1 },
                { field: 'email', headerName: t('email'), flex: 1 },
                { field: 'address', headerName: t('address'), flex: 1 },
                { field: 'postalCode', headerName: t('postal_code'), flex: 1 },
                { field: 'phoneNumber', headerName: t('phone_number'), flex: 1 },
                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any; }; }) => (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => window.open(`/management/location-admins/view/${params.row.id}`, '_blank')}
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
            name: 'locations',
            label: t('locations'),
            section: t('locations'),
            isArray: true,
            columns: [
                { field: 'name', headerName: t('location_name'), flex: 1 },
                { field: 'address', headerName: t('address'), flex: 1 },
                { field: 'postalCode', headerName: t('postal_code'), flex: 1 },                {
                    field: 'actions',
                    headerName: t('actions'),
                    renderCell: (params: { row: { id: any; }; }) => (
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
        // Add more fields as necessary
    ];

    const transformedData = {
        ...franchise,
        'createdAt': franchise?.createdAt ? format(new Date(franchise.createdAt), 'PPpp') : '',
    };

    return (
        <Box sx={{ position: 'relative', padding: 4 }}>
           {franchise ? (  // Ensure franchise is not null or undefined before rendering
      <ReusableDetails
        fields={Fields}
        data={transformedData}
        entityName={t(franchise.name)} // Now safe to access franchise.name
      />
    ) : (
      <Typography variant="h6">No franchise data available</Typography> // Fallback content if franchise is null
    )}
        </Box>
    );
};

export default ViewFranchisePage;
