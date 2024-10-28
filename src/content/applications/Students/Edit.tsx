import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import UploadSection from 'src/components/Files/UploadDocuments';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import { fetchLocations } from 'src/services/locationService';
import { fetchStudentById, fetchStudentDocumentsById, updateStudent } from 'src/services/studentService';
import { assignStudentToTopics, fetchTopics } from 'src/services/topicService';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { assignOrUpdateParentStudents, fetchParents } from 'src/services/parentService';

const EditStudent = () => {
    const { id } = useParams<{ id: string }>();
    const [studentData, setStudentData] = useState<Record<string, any> | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]); // Changed to an array for multiple locations
    const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showMessage } = useSnackbar();

    // Fetch student data and documents by ID on component mount
    const fetchStudent = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchStudentById(Number(id));
            const studentDocuments = await fetchStudentDocumentsById(Number(id));

            if (fetchedData && fetchedData.user && fetchedData.parent) {
                const flattenedData = {
                    ...fetchedData,
                    firstName: fetchedData.user.firstName,
                    lastName: fetchedData.user.lastName,
                    dob: formatDateForInput(fetchedData.user.dob),
                    email: fetchedData.user.email,
                    address: fetchedData.user.address,
                    postalCode: fetchedData.user.postalCode,
                    phoneNumber: fetchedData.user.phoneNumber,
                    contractEndDate: fetchedData.contractEndDate ? formatDateForInput(fetchedData.contractEndDate) : '',
                    parent: [
                        {
                            firstName: fetchedData.parent.user.firstName,
                            lastName: fetchedData.parent.user.lastName,
                        },
                    ],
                };
                
                setStudentData(flattenedData);
                setSelectedLocations(fetchedData.locations || []); // Set multiple locations
                setSelectedParentId(fetchedData.parent.id);
                setSelectedTopics(fetchedData.topics || []);
            }

            const formattedDocuments = studentDocuments.documents.map((doc) => ({
                id: doc.id,
                fileName: doc.name,
                fileType: doc.type,
                file: null,
                path: doc.path,
            }));

            setUploadedFiles(formattedDocuments);
        } catch (error) {
            console.error('Error fetching student:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const handleLocationSelect = (locations: any[]) => {
        setSelectedLocations(locations); // Capture selected locations as an array
    };

    const handleParentSelect = (parent: any) => {
        setSelectedParentId(parent ? parent.id : null);
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

    const handleStudentSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (data.password && data.password !== data.confirmPassword) {
            showMessage("Passwords do not match", 'error');
            return;
        }
        if (!selectedParentId) {
            showMessage("Parent field is required", 'error');
            return;
        }
        if (selectedLocations.length === 0) {
            showMessage("At least one location must be selected", 'error');
            return;
        }
        if (selectedTopics.length === 0) {
            showMessage("Topics field can't be empty", 'error');
            return;
        }

        setLoading(true);
        try {
            const topicIds = selectedTopics.map(topic => topic.id);
            const locationIds = selectedLocations.map(location => location.id);

            const userPayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                dob: data.dob,
                email: data.email,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
                password: data.password,
            };

            const studentPayload = {
                payPerHour: data.payPerHour,
                individualPayPerHour: data.individualPayPerHour,
                status: data.status,
                gradeLevel: data.gradeLevel,
                contractType: data.contractType,
                contractEndDate: data.contractEndDate,
                notes: data.notes,
                availableDates: data.availableDates,
                locationIds, // Updated to send multiple location IDs
            };

            const response = await updateStudent(Number(id), userPayload, studentPayload);
            await assignStudentToTopics(Number(id), topicIds);
            await assignOrUpdateParentStudents(selectedParentId, [response.studentId]);

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

            await fetchStudent();
            return response;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const parentSelectionField = {
        name: 'parent',
        label: 'Select Parent',
        type: 'custom',
        section: 'Student Assignment',
        component: (
            <SingleSelectWithAutocomplete
                label="Search Parent"
                fetchData={(query) => fetchParents(1, 5, query).then((data) => data.data)}
                onSelect={handleParentSelect}
                displayProperty="firstName"
                placeholder="Type to search parent"
                initialValue={selectedParentId}
            />
        ),
    };

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

    const studentFields = [
        { name: 'payPerHour', label: t('pay_per_hour'), type: 'number', required: true, section: 'Student Information' },
        { name: 'individualPayPerHour', label: t('ind_pay_per_her'), type: 'number', required: true, section: 'Student Information' },
        { name: 'status', label: t('status'), type: 'text', required: true, section: 'Student Information' },
        { name: 'gradeLevel', label: t('grade_level'), type: 'number', required: true, section: 'Student Information' },
        { name: 'contractType', label: t('contract_type'), type: 'text', required: true, section: 'Student Information' },
        { name: 'contractEndDate', label: t('contract_end_date'), type: 'date', required: true, section: 'Student Information' },
        { name: 'notes', label: t('notes'), type: 'text', required: false, section: 'Student Information' },
        { name: 'availableDates', label: t('available_dates'), type: 'text', required: true, section: 'Student Information' },
        parentSelectionField,
        {
            name: 'locations',
            label: 'Locations',
            type: 'custom',
            section: 'Student Assignment',
            component: (
                <MultiSelectWithCheckboxes
                    label="Search Location"
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search location"
                    initialValue={selectedLocations}
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
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && studentData && (
                <ReusableForm
                    key={studentData.id}
                    fields={[...userFields, ...studentFields]}
                    onSubmit={handleStudentSubmit}
                    initialData={studentData}
                    entityName="Student"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditStudent;
