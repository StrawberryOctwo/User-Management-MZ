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
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showMessage } = useSnackbar();

    const fetchTeacher = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchTeacherById(Number(id));
            const teacherDocuments = await fetchTeacherDocumentsById(Number(id));

            const flattenedData = {
                ...fetchedData,
                firstName: fetchedData.user.firstName,
                lastName: fetchedData.user.lastName,
                dob: formatDateForInput(fetchedData.user.dob),
                email: fetchedData.user.email,
                city: fetchedData.user.city,
                address: fetchedData.user.address,
                postalCode: fetchedData.user.postalCode,
                phoneNumber: fetchedData.user.phoneNumber,
                contractStartDate: formatDateForInput(fetchedData.contractStartDate),
                contractEndDate: formatDateForInput(fetchedData.contractEndDate),
            };

            setTeacherData(flattenedData);
            setSelectedLocations(fetchedData.locations);
            setSelectedTopics(fetchedData.topics);

            const formattedDocuments = teacherDocuments.documents.map((doc: { id: any, name: any; type: any; path: any; }) => ({
                id: doc.id,
                fileName: doc.name,
                fileType: doc.type,
                file: null,
                path: doc.path
            }));

            setUploadedFiles(formattedDocuments);

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
        return d.toISOString().split('T')[0];
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

            const userData = {
                firstName: data.firstName,
                lastName: data.lastName,
                dob: data.dob,
                email: data.email,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                password: data.password,
                city: data.city,
            };

            const teacherData = {
                status: data.status,
                employeeNumber: data.employeeNumber,
                idNumber: data.idNumber,
                taxNumber: data.taxNumber,
                contractStartDate: data.contractStartDate,
                contractEndDate: data.contractEndDate,
                hourlyRate: data.hourlyRate,
                rateMultiplier: data.rateMultiplier,
                sessionRateMultiplier: data.sessionRateMultiplier, bank: data.bank,
                iban: data.iban,
                bic: data.bic,
            };
            const response = await updateTeacher(Number(id), userData, teacherData);

            await assignTeacherToLocations(Number(id), locationIds);
            await assignTeacherToTopics(Number(id), topicIds);

            const userId = response.userId;
            for (const file of uploadedFiles) {
                const documentPayload = {
                    type: file.fileType,
                    customFileName: file.fileName,
                    userId: String(userId),
                };
                if (file.file) {
                    await addDocument(documentPayload, file.file);
                }
            }

            await fetchTeacher();

            return response;
        } catch (error: any) {
            console.error('Error updating teacher:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const statusOptions = [
        { label: t('active'), value: 'active' },
        { label: t('inactive'), value: 'inactive' },
        { label: t('interested'), value: 'interested' },
    ];

    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'city', label: t('city'), type: 'text', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'number', required: true, section: 'User Information' },
        { name: 'password', label: t('new_password'), type: 'password', required: false, section: 'Change Password' },
        { name: 'confirmPassword', label: t('confirm_password'), type: 'password', required: false, section: 'Change Password' },
    ];

    const teacherFields = [
        { name: 'status', label: t('status'), type: 'select', required: true, section: 'Teacher Information', options: statusOptions },
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
            label: t('locations'),
            type: 'custom',
            section: 'Teacher Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_locations')}
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search locations"
                    initialValue={selectedLocations}
                />
            ),
        },
        {
            name: 'topics',
            label: t('topics'),
            type: 'custom',
            section: 'Teacher Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_topics')}
                    fetchData={(query) => fetchTopics(1, 5, query, 'name').then((data) => data.data)}
                    onSelect={handleTopicSelect}
                    displayProperty="name"
                    placeholder="Type to search topics"
                    initialValue={selectedTopics}
                />
            ),
        },
        {
            name: 'documents',
            label: 'Uploaded Documents',
            type: 'custom',
            section: 'Documents',
            component: <UploadSection onUploadChange={handleFilesChange} initialDocuments={uploadedFiles} />,
            xs: 12,
            sm: 12,
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && teacherData && (
                <ReusableForm
                    key={teacherData.id}
                    fields={[...userFields, ...teacherFields]}
                    onSubmit={handleTeacherSubmit}
                    initialData={teacherData}
                    entityName="Teacher"
                    entintyFunction='Edit'
                />
            )}
        </Box>
    );
};

export default EditTeacher;
