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

const EditStudent = () => {
    const { id } = useParams<{ id: string }>();
    const [studentData, setStudentData] = useState<Record<string, any> | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch student data and documents by ID on component mount
    const fetchStudent = async () => {
        setLoading(true);
        try {
            const fetchedData = await fetchStudentById(Number(id));
            const studentDocuments = await fetchStudentDocumentsById(Number(id)); // Fetch student documents

            if (fetchedData && fetchedData.user && fetchedData.parent) {
                // Flatten the user and parent fields for the form
                const flattenedData = {
                    ...fetchedData,
                    firstName: fetchedData.user.firstName,
                    lastName: fetchedData.user.lastName,
                    dob: formatDateForInput(fetchedData.user.dob), // Format date for input
                    email: fetchedData.user.email,
                    address: fetchedData.user.address,
                    postalCode: fetchedData.user.postalCode,
                    phoneNumber: fetchedData.user.phoneNumber,
                    contractEndDate: fetchedData.contractEndDate ? formatDateForInput(fetchedData.contractEndDate) : '', // Safe check for contractEndDate
                    // Flatten parent data for the form
                    accountHolder: fetchedData.parent.accountHolder,
                    iban: fetchedData.parent.iban,
                    bic: fetchedData.parent.bic,
                };

                setStudentData(flattenedData);
                setSelectedLocation(fetchedData.location || null); // Set selected location
                setSelectedTopics(fetchedData.topics || []); // Set selected topics
            }

            // Map the documents retrieved from the API to the format needed for the UploadSection
            const formattedDocuments = studentDocuments.documents.map((doc: { id: any, name: any; type: any; path: any; }) => ({
                id: doc.id,
                fileName: doc.name,
                fileType: doc.type,
                file: null, // No actual file data, just the metadata
                path: doc.path, // You can use this to display a link to the file
            }));

            setUploadedFiles(formattedDocuments); // Set initial documents in state
        } catch (error) {
            console.error('Error fetching student:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const handleLocationSelect = (selectedItem: any) => {
        setSelectedLocation(selectedItem); // Capture selected location
    };

    const handleTopicSelect = (selectedItems: any[]) => {
        setSelectedTopics(selectedItems); // Capture selected topics
    };

    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files); // Capture uploaded files
    };

    const formatDateForInput = (date: string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    };

    const handleStudentSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        setLoading(true);
        try {
            const topicIds = selectedTopics.map(topic => topic.id);

            const parentPayload = {
                accountHolder: data.accountHolder,
                iban: data.iban,
                bic: data.bic,
            };

            const userPayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                dob: data.dob,
                email: data.email,
                address: data.address,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber,
            };

            const studentPayload = {
                payPerHour: data.payPerHour,
                status: data.status,
                gradeLevel: data.gradeLevel,
                contractType: data.contractType,
                contractEndDate: data.contractEndDate,
                notes: data.notes,
                availableDates: data.availableDates,
                locationId: selectedLocation ? selectedLocation.id : null, // Handle null case here
            };

            // Update student and user data together
            const response = await updateStudent(Number(id), parentPayload, userPayload, studentPayload);

            // Assign the student to multiple topics
            await assignStudentToTopics(Number(id), topicIds);

            // Upload documents for the student
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

            // Refetch student data after successful update
            await fetchStudent();

            return response;
        } catch (error: any) {
            console.error('Error updating student:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Define fields for the form
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
            label: 'Location',
            type: 'custom',
            section: 'Student Assignment',
            component: (
                <SingleSelectWithAutocomplete
                    label="Search Location"
                    fetchData={(query) => fetchLocations(1, 5, query).then((data) => data.data)}
                    onSelect={handleLocationSelect}
                    displayProperty="name"
                    placeholder="Type to search location"
                    initialValue={selectedLocation}
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
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && studentData && (
                <ReusableForm
                    key={studentData.id} // Add key to force re-render when studentData changes
                    fields={[...parentFields, ...userFields, ...studentFields]}
                    onSubmit={handleStudentSubmit}
                    initialData={studentData} // Pre-fill form with student data
                    entityName="Student"
                    entintyFunction="Edit"
                />
            )}
        </Box>
    );
};

export default EditStudent;
