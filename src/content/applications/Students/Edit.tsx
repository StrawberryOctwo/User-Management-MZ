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
import { assignStudentToContract, fetchContractPackagesByEntity } from 'src/services/contractPackagesService';

const EditStudent = () => {
    const { id } = useParams<{ id: string }>();
    const [studentData, setStudentData] = useState<Record<string, any> | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<any[]>([]); // Changed to an array for multiple locations
    const [selectedParent, setSelectedParent] = useState<any | null>(null);
    const [selectedContract, setSelectedContract] = useState<any | null>(null);

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

            if (fetchedData && fetchedData.user) {
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
                    parent: fetchedData.parent
                        ? {
                            id: fetchedData.parent.id,
                            accountHolder: fetchedData.parent.user.firstName,
                        }
                        : null, // Set parent to null if not present
                };

                setStudentData(flattenedData);
                setSelectedLocations(fetchedData.locations || []); // Set multiple locations
                setSelectedParent(flattenedData.parent);
                setSelectedTopics(fetchedData.topics || []);
                setSelectedContract(fetchedData.contract)
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
    const handleContractSelect = (contract) => {
        console.log(contract)
        setSelectedContract(contract);
    };
    const handleParentSelect = (parent) => {
        console.log(parent)
        setSelectedParent(parent); // Store the full parent object
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
        if (!selectedParent) {
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
                status: data.status,
                contractType: data.contractType,
                contractEndDate: data.contractEndDate,
                notes: data.notes,
                availableDates: data.availableDates,
                gradeLevel: data.gradeLevel,
                locationIds, // Updated to send multiple location IDs
            };

            const response = await updateStudent(Number(id), userPayload, studentPayload);
            await assignStudentToTopics(Number(id), topicIds);
            await assignOrUpdateParentStudents(selectedParent.id, [response.studentId]);
            await assignStudentToContract(response.studentId, selectedContract.id)
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

    const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Grade ${i + 1}`,
    }));

    const contractSelectionField = {
        name: 'contracts',
        label: 'Contracts',
        type: 'custom',
        section: 'Student Information',
        component: (
            <SingleSelectWithAutocomplete
                label="Search Contracts"
                fetchData={(query) =>
                    fetchContractPackagesByEntity(1, 5).then((data) =>
                        data.data
                    )
                }
                onSelect={handleContractSelect}
                displayProperty="name"
                placeholder="Type to search contracts"
                initialValue={selectedContract}
            />
        ),
    };
    const parentSelectionField = {
        name: 'parent',
        label: 'Select Parent',
        type: 'custom',
        section: 'Student Assignment',
        component: (
            <SingleSelectWithAutocomplete
                label="Search Parent"
                fetchData={(query) =>
                    fetchParents(1, 5, query).then((response) =>
                        response.data.map((parent) => ({
                            ...parent,
                            accountHolder: parent.user.firstName, // Use user.firstName as accountHolder
                        }))
                    )
                }
                onSelect={handleParentSelect}
                displayProperty="accountHolder"
                placeholder="Type to search parent"
                initialValue={selectedParent}
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
        { name: 'status', label: t('status'), type: 'text', required: true, section: 'Student Information' },
        {
            name: 'gradeLevel',
            label: t('grade_level'),
            type: 'custom',
            required: true,
            section: 'Student Information',
            component: (
                <SingleSelectWithAutocomplete
                    label="Select Grade Level"
                    fetchData={() => Promise.resolve(gradeOptions)} // Static data function
                    onSelect={(selectedGrade) => setStudentData((prevData) => ({
                        ...prevData,
                        gradeLevel: selectedGrade ? selectedGrade.id : null,
                    }))}
                    displayProperty="name"
                    placeholder="Select Grade"
                    initialValue={studentData?.gradeLevel ? gradeOptions.find(grade => grade.id === studentData.gradeLevel) : null}
                />
            ),
        },
        { name: 'contractEndDate', label: t('contract_end_date'), type: 'date', required: true, section: 'Student Information' },
        { name: 'notes', label: t('notes'), type: 'text', required: false, section: 'Student Information' },
        { name: 'availableDates', label: t('available_dates'), type: 'text', required: true, section: 'Student Information' },
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
        parentSelectionField,
        contractSelectionField,
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
