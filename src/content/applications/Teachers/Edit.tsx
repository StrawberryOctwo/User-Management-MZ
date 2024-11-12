import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import UploadSection from 'src/components/Files/UploadDocuments';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import { assignTeacherToLocations, fetchLocations } from 'src/services/locationService';
import { fetchTeacherById, fetchTeacherDocumentsById, updateTeacher } from 'src/services/teacherService';
import { assignTeacherToTopics, fetchTopics } from 'src/services/topicService';
import { useSnackbar } from 'src/contexts/SnackbarContext';

const EditTeacher = () => {
    const { id } = useParams<{ id: string }>();
    const [teacherData, setTeacherData] = useState<Record<string, any> | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]); // For storing uploaded files
    const [loading, setLoading] = useState(true);
    const { showMessage } = useSnackbar();

    // Fetch teacher data and documents by ID on component mount
    const fetchTeacher = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchTeacherById(Number(id));
            const teacherDocuments = await fetchTeacherDocumentsById(Number(id)); // Fetch teacher documents

            // Flatten the user fields for the form
            const flattenedData = {
                ...fetchedData,
                firstName: fetchedData.user.firstName,
                lastName: fetchedData.user.lastName,
                dob: formatDateForInput(fetchedData.user.dob), // Format date for input
                email: fetchedData.user.email,
                address: fetchedData.user.address,
                postalCode: fetchedData.user.postalCode,
                phoneNumber: fetchedData.user.phoneNumber,
                contractStartDate: formatDateForInput(fetchedData.contractStartDate), // Format date for input
                contractEndDate: formatDateForInput(fetchedData.contractEndDate), // Format date for input
            };

            setTeacherData(flattenedData);
            setSelectedLocations(fetchedData.locations); // Set selected locations
            setSelectedTopics(fetchedData.topics); // Set selected topics

            // Map the documents retrieved from the API to the format needed for the UploadSection
            const formattedDocuments = teacherDocuments.documents.map((doc: { id: any, name: any; type: any; path: any; }) => ({
                id: doc.id,
                fileName: doc.name,
                fileType: doc.type,
                file: null, // No actual file data, just the metadata
                path: doc.path // You can use this to display a link to the file
            }));

            setUploadedFiles(formattedDocuments); // Set initial documents in state

        } catch (error) {
            console.error('Error fetching teacher:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTeacher();
    }, [id]);

    const handleLocationSelect = (selectedItems: any[]) => {
        setSelectedLocations(selectedItems);
    };

    const handleTopicSelect = (selectedItems: any[]) => {
        setSelectedTopics(selectedItems);
    };

    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files);
    };

    const formatDateForInput = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    };

    const handleTeacherSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (data.password && data.password !== data.confirmPassword) {
            showMessage("Passwords do not match", 'error');
            return;
        }

        if (selectedLocations.length == 0) {
            showMessage("Locations field is required", 'error')
            return
        }
        if (selectedTopics.length == 0) {
            showMessage("Topics field can't be empty", 'error')
            return
        }
        setLoading(true);
        try {
            const locationIds = selectedLocations.map(location => location.id);
            const topicIds = selectedTopics.map(topic => topic.id);

            // Separate user and teacher data
            const userData = {
                firstName: data.firstName,
                lastName: data.lastName,
                dob: data.dob,
                email: data.email,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                password: data.password
            };

            const teacherData = {
                employeeNumber: data.employeeNumber,
                idNumber: data.idNumber,
                taxNumber: data.taxNumber,
                contractStartDate: data.contractStartDate,
                contractEndDate: data.contractEndDate,
                hourlyRate: data.hourlyRate,
                rateMultiplier : data.rateMultiplier,
                sessionRateMultiplier : data.sessionRateMultiplier,                bank: data.bank,
                iban: data.iban,
                bic: data.bic,
            };
            console.log(data.rateMultiplier)
            // Update teacher and user data together
            const response = await updateTeacher(Number(id), userData, teacherData);

            // Assign the teacher to multiple locations and multiple topics
            await assignTeacherToLocations(Number(id), locationIds);
            await assignTeacherToTopics(Number(id), topicIds);

            // Upload documents for the teacher
            const userId = response.userId;
            for (const file of uploadedFiles) {
                const documentPayload = {
                    type: file.fileType,
                    customFileName: file.fileName,
                    userId: String(userId),
                };
                if (file.file) {
                    await addDocument(documentPayload, file.file); // Upload file only if it's new
                }
            }

            // Refetch teacher data after successful update
            await fetchTeacher();

            return response;
        } catch (error: any) {
            console.error('Error updating teacher:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Define fields for the form
    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'User Information' },
        { name: 'password', label: t('new_password'), type: 'password', required: false, section: 'Change Password' },
        { name: 'confirmPassword', label: t('confirm_password'), type: 'password', required: false, section: 'Change Password' },
    ];

    const teacherFields = [
        { name: 'hourlyRate', label: t('hourly_rate'), type: 'number', required: true, section: 'Teacher Information' },
        { name: 'rateMultiplier', label: 'rateMultiplier', type: 'number', required: true, section: 'Teacher Information' },
        { name: 'sessionRateMultiplier', label: 'sessionRateMultiplier', type: 'number', required: true, section: 'Teacher Information' },
        { name: 'employeeNumber', label: t('employee_number'), type: 'text', required: true, section: 'Teacher Information' },
        { name: 'idNumber', label: t('id_number'), type: 'text', required: false, section: 'Teacher Information' },
        { name: 'contractStartDate', label: t('contract_start_date'), type: 'date', required: true, section: 'Teacher Information' },
        { name: 'contractEndDate', label: t('contract_end_date'), type: 'date', required: true, section: 'Teacher Information' },
        { name: 'bank', label: t('bank'), type: 'text', required: true, section: 'Bank Details' },
        { name: 'iban', label: t('iban'), type: 'text', required: true, section: 'Bank Details' },
        { name: 'bic', label: t('bic'), type: 'text', required: false, section: 'Bank Details' },
        {
            name: 'locations',
            label: 'Locations',
            type: 'custom',
            section: 'Teacher Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_locations')}
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search locations"
                    initialValue={selectedLocations} // Pre-fill selected locations
                />
            ),
        },
        {
            name: 'topics',
            label: 'Topics',
            type: 'custom',
            section: 'Teacher Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_topics')}
                    fetchData={(query) => fetchTopics(1, 5, query, 'name').then((data) => data.data)}
                    onSelect={handleTopicSelect}
                    displayProperty="name"
                    placeholder="Type to search topics"
                    initialValue={selectedTopics} // Pre-fill selected topics
                />
            ),
        },
        {
            name: 'documents',
            label: 'Uploaded Documents',
            type: 'custom',
            section: 'Documents',
            component: <UploadSection onUploadChange={handleFilesChange} initialDocuments={uploadedFiles} />, // Pass initial documents
            xs: 12,
            sm: 12,
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && teacherData && (
                <ReusableForm
                    key={teacherData.id} // Add key to force re-render when teacherData changes
                    fields={[...userFields, ...teacherFields]}
                    onSubmit={handleTeacherSubmit}
                    initialData={teacherData} // Pre-fill form with teacher data
                    entityName="Teacher"
                    entintyFunction='Edit'
                />
            )}
        </Box>
    );
};

export default EditTeacher;
