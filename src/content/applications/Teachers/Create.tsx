import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import UploadSection from 'src/components/Files/UploadDocuments';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import { assignTeacherToLocations, fetchLocations } from 'src/services/locationService';
import { addTeacher } from 'src/services/teacherService';
import { assignTeacherToTopics, fetchTopics } from 'src/services/topicService';
import { generateEmployeeNumber } from 'src/utils/teacherUtils';

const CreateTeacher = () => {
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [intervalId, setIntervalId] = useState<number | null>(null);

    // New states for form fields
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        employeeNumber: '', // Auto-generated employee number
    });

    // Function to start generating employee number every 1 second once fields are filled
    useEffect(() => {
        if (formData.firstName && formData.lastName && formData.dob && !intervalId) {
            const id = window.setInterval(() => {
                const generatedEmployeeNumber = generateEmployeeNumber(formData.firstName, formData.lastName, formData.dob);
                setFormData((prevData) => ({ ...prevData, employeeNumber: generatedEmployeeNumber }));
            }, 1000);
            setIntervalId(id);
        }

        // Clean up interval on unmount or when fields change
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
        };
    }, [formData.firstName, formData.lastName, formData.dob]);

    const handleLocationSelect = (selectedItems: any[]) => {
        setSelectedLocations(selectedItems);
    };

    const handleTopicSelect = (selectedItems: any[]) => {
        setSelectedTopics(selectedItems);
    };

    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleTeacherSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);
        try {
            const locationIds = selectedLocations.map(location => location.id);
            const topicIds = selectedTopics.map(topic => topic.id);

            const payload = {
                user: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dob: formData.dob,
                    email: data.email,
                    password: data.password,
                    address: data.address,
                    postalCode: data.postalCode,
                    phoneNumber: data.phoneNumber,
                },
                teacher: {
                    employeeNumber: formData.employeeNumber, // Use the generated employee number
                    idNumber: data.idNumber,
                    taxNumber: data.taxNumber,
                    contractStartDate: data.contractStartDate,
                    contractEndDate: data.contractEndDate,
                    hourlyRate: data.hourlyRate,
                    bank: data.bank,
                    iban: data.iban,
                    bic: data.bic,
                }
            };

            // Step 1: Create the teacher
            const response = await addTeacher(payload);

            // Step 2: Assign the teacher to multiple locations and multiple topics
            await assignTeacherToLocations(response.teacherId, locationIds);
            await assignTeacherToTopics(response.teacherId, topicIds);

            // Step 3: Upload documents for the created teacher
            const userId = response.userId;
            for (const file of uploadedFiles) {
                const documentPayload = {
                    type: file.fileType,
                    customFileName: file.fileName,
                    userId: userId,
                };

                await addDocument(documentPayload, file.file);
            }

            setSelectedLocations([]);
            setSelectedTopics([]);
            return response;
        } catch (error: any) {
            console.error("Error adding teacher:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const userFields: FieldConfig[] = [
        { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'User Information', onChange: handleInputChange },
        { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'User Information', onChange: handleInputChange },
        { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'User Information', onChange: handleInputChange },
        { name: 'email', label: t('email'), type: 'email', required: true, section: 'User Information' },
        { name: 'password', label: t('password'), type: 'password', required: true, section: 'User Information' },
        { name: 'address', label: t('address'), type: 'text', required: true, section: 'User Information' },
        { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'User Information' },
        { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'User Information' },
    ];

    const teacherFields = [
        { name: 'hourlyRate', label: 'Hourly Rate', type: 'number', required: true, section: 'Teacher Information' },
        { name: 'taxNumber', label: 'Tax Number', type: 'text', required: true, section: 'Teacher Information' },
        { name: 'employeeNumber', label: 'Employee Number', type: 'text', value: formData.employeeNumber, disabled: true, required: true, section: 'Teacher Information' }, // Disabled and auto-filled
        { name: 'idNumber', label: 'ID Number', type: 'text', required: false, section: 'Teacher Information' },
        { name: 'contractStartDate', label: 'Contract Start Date', type: 'date', required: true, section: 'Teacher Information' },
        { name: 'contractEndDate', label: 'Contract End Date', type: 'date', required: true, section: 'Teacher Information' },
        { name: 'bank', label: 'Bank', type: 'text', required: true, section: 'Bank Details' },
        { name: 'iban', label: 'IBAN', type: 'text', required: true, section: 'Bank Details' },
        { name: 'bic', label: 'BIC', type: 'text', required: false, section: 'Bank Details' },
        {
            name: 'locations',
            label: 'Locations',
            type: 'custom',
            required: true, 
            section: 'Teacher Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label={t('Search_and_assign_locations')}
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search locations"
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
                />
            ),
        },
        {
            name: 'documents',
            label: 'Upload Documents',
            type: 'custom',
            section: 'Documents',
            component: <UploadSection onUploadChange={handleFilesChange} />, // Pass the handler to capture uploaded files
            xs: 12,
            sm: 12,
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={[...userFields, ...teacherFields]} // Merge both field arrays
                onSubmit={handleTeacherSubmit}
                entityName="Teacher"
                entintyFunction='Add'
            />
        </Box>
    );
};

export default CreateTeacher;
