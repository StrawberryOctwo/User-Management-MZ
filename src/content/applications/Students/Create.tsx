import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';

import { t } from 'i18next';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import { fetchLocations } from 'src/services/locationService';
import { addStudent } from 'src/services/studentService';
import { assignStudentToTopics, fetchTopics } from 'src/services/topicService';
import UploadSection from 'src/components/Files/UploadDocuments';
import { useSnackbar } from 'src/contexts/SnackbarContext';

export default function CreateStudent() {
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<any[]>([]); // State for selected topics
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]); // State for uploaded files
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<any>(null);
    const { showMessage } = useSnackbar();

    const handleLocationSelect = (location: any) => {
        if (!location) {
            setSelectedLocationId(null);
            setSelectedLocationName(null);
        } else {
            setSelectedLocationId(location.id);
            setSelectedLocationName(location.name);
        }
    };

    const handleTopicSelect = (selectedItems: any[]) => {
        setSelectedTopics(selectedItems); // Capture selected topics
    };

    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files); // Capture uploaded files
    };

    const handleStudentSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {

        if (selectedLocationId == null) {
            showMessage("Location field is required", 'error')
            return
        }
        if (selectedTopics.length == 0) {
            showMessage("Topics field can't be empty", 'error')
            return
        }
        setLoading(true);
        try {

            const topicIds = selectedTopics.map(topic => topic.id); // Extract topic IDs

            const payload = {
                parent: {
                    accountHolder: data['accountHolder'],
                    iban: data['iban'],
                    bic: data['bic'],
                },
                user: {
                    firstName: data['firstName'],
                    lastName: data['lastName'],
                    dob: data['dob'],
                    email: data['email'],
                    password: data['password'],
                    address: data['address'],
                    postalCode: data['postalCode'],
                    phoneNumber: data['phoneNumber'],
                },
                student: {
                    payPerHour: data['payPerHour'],
                    status: data['status'],
                    gradeLevel: data['gradeLevel'],
                    contractType: data['contractType'],
                    contractEndDate: data['contractEndDate'],
                    notes: data['notes'],
                    availableDates: data['availableDates'],
                    locationId: selectedLocationId ? selectedLocationId : null,
                }
            };

            // Step 1: Add the student
            const response = await addStudent(payload);

            // Step 2: Assign topics to the student
            await assignStudentToTopics(response.studentId, topicIds);

            // Step 3: Upload documents for the student
            const userId = response.userId;
            for (const file of uploadedFiles) {
                const documentPayload = {
                    type: file.fileType,
                    customFileName: file.fileName,
                    userId: userId, // Use the student's ID
                };

                await addDocument(documentPayload, file.file); // Call API for each file
            }

            // Reset form fields
            setSelectedLocationId(null);
            setSelectedLocationName(null);
            setSelectedTopics([]);
            setUploadedFiles([]);
            if (dropdownRef.current) {
                dropdownRef.current.reset();
            }

            return response;
        } catch (error: any) {
            console.error("Error adding student:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const parentFields: FieldConfig[] = [
        { name: 'accountHolder', label: t('parent_account_holder'), type: 'text', required: true, section: 'Parent Information' },
        { name: 'iban', label: t('parent_iban'), type: 'text', required: true, section: 'Parent Information' },
        { name: 'bic', label: t('parent_bic'), type: 'text', required: false, section: 'Parent Information' },
    ];

    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information' },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information' },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'password', label: t('password'), type: 'password', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'User Information' },
    ];

    const studentFields = [
        { name: 'payPerHour', label: t('pay_per_hour'), type: 'number', required: true, section: 'Student Information' },
        { name: 'status', label: t('status'), type: 'text', required: true, section: 'Student Information' },
        { name: 'gradeLevel', label: t('grade_level'), type: 'number', required: true, section: 'Student Information' },
        { name: 'contractType', label: t('contract_type'), type: 'text', required: true, section: 'Student Information' },
        { name: 'contractEndDate', label: t('contract_end_date'), type: 'date', required: true, section: 'Student Information' },
        { name: 'notes', label: t('notes'), type: 'text', required: false, section: 'Student Information' },
        { name: 'availableDates', label: t('available_dates'), type: 'text', required: true, section: 'Student Information' },
        {
            name: 'locations',
            label: 'Locations',
            type: 'custom',
            section: 'Student Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    label="Search Location"
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search location"
                />
            ),
        },
        {
            name: 'topics',
            label: 'Assign Topics',
            type: 'custom',
            section: 'Student Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_topics')}
                    fetchData={(query) => fetchTopics(1, 5, query, 'name').then((data) => data.data)}
                    onSelect={handleTopicSelect}
                    displayProperty="name"
                    placeholder="Type to search topics"
                />
            ),
        },
        {
            name: 'documents',
            label: 'Upload Documents',
            type: 'custom',
            section: 'Documents',
            component: <UploadSection onUploadChange={handleFilesChange} />,
            xs: 12,
            sm: 12,
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={[...parentFields, ...userFields, ...studentFields]} // Combine field configurations
                onSubmit={handleStudentSubmit}
                entityName="Student"
                entintyFunction="Add"
            />
        </Box>
    );
}
