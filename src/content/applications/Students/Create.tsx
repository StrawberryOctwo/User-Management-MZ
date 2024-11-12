import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import { fetchLocations } from 'src/services/locationService';
import { assignOrUpdateParentStudents, fetchParents } from 'src/services/parentService';
import { addStudent } from 'src/services/studentService';
import { assignStudentToTopics, fetchTopics } from 'src/services/topicService';
import UploadSection from 'src/components/Files/UploadDocuments';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { assignStudentToContract, fetchContractPackagesByEntity } from 'src/services/contractPackagesService';
import { fetchSchoolTypes } from 'src/services/schoolTypeService';

export default function CreateStudent() {
    const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]); // Update to handle multiple IDs
    const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
    const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [selectedSchoolTypeId, setSelectedSchoolTypeId] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<any>(null);
    const { showMessage } = useSnackbar();

    const handleLocationSelect = (locations: any[]) => {
        setSelectedLocationIds(locations.map(location => location.id));
    };

    const handleParentSelect = (parent: any) => {
        setSelectedParentId(parent ? parent.id : null);
    };

    const handleContractSelect = (contract: any) => {
        setSelectedContractId(contract ? contract.id : null);
    };


    const handleTopicSelect = (selectedItems: any[]) => {
        setSelectedTopics(selectedItems);
    };

    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files);
    };

    const handleSchoolTypeSelect = (schoolType: any) => {
     
        setSelectedSchoolTypeId(schoolType ? schoolType.id : null);

    };
    const handleStudentSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
        if (selectedLocationIds.length === 0) {
            showMessage("Location field is required", 'error');
            return;
        }
        if (!selectedParentId) {
            showMessage("Parent field is required", 'error');
            return;
        }
        if (selectedTopics.length === 0) {
            showMessage("Topics field can't be empty", 'error');
            return;
        }

        setLoading(true);
        try {
            const topicIds = selectedTopics.map(topic => topic.id);

            const payload = {
                student: {
                    status: data['status'],
                    gradeLevel: data['gradeLevel'],
                    contract: data['contract'],
                    contractEndDate: data['contractEndDate'],
                    notes: data['notes'],
                    availableDates: data['availableDates'],
                    locationIds: selectedLocationIds, 
                    parentId: selectedParentId, 
                    schoolType: selectedSchoolTypeId
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
            };

            const response = await addStudent(payload);
            console.log(selectedContractId)
            await assignStudentToTopics(response.studentId, topicIds);
            await assignOrUpdateParentStudents(selectedParentId, [response.studentId]);
            await assignStudentToContract(response.studentId,selectedContractId)

            const userId = response.userId;
            for (const file of uploadedFiles) {
                const documentPayload = {
                    type: file.fileType,
                    customFileName: file.fileName,
                    userId: userId,
                };
                await addDocument(documentPayload, file.file);
            }

            setSelectedLocationIds([]); 
            setSelectedParentId(null);
            setSelectedContractId(null);
            setSelectedTopics([]);
            setUploadedFiles([]); 
            setSelectedSchoolTypeId(null);
            if (dropdownRef.current) dropdownRef.current.reset();

            return response;
        } catch (error: any) {
            console.error("Error adding student:", error);
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
                fetchData={(query) =>
                    fetchParents(1, 5, query).then((data) =>
                        data.data.map((parent) => ({
                            ...parent,
                            displayName: parent.user.firstName,
                        }))
                    )
                }
                onSelect={handleParentSelect}
                displayProperty="displayName"
                placeholder="Type to search parent"
            />
        ),
    };
    const schoolTypeSelectionField = {
        name: 'schoolType',
        label: 'School Type',
        type: 'custom',
        section: 'Student Information',
        component: (
            <SingleSelectWithAutocomplete
                label="Search School Type"
                fetchData={(query) => fetchSchoolTypes().then((data) => data)}
                onSelect={handleSchoolTypeSelect}
                displayProperty="name"
                placeholder="Type to search school type"
            />
        ),
    };
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
            />
        ),
    };
    const locationSelectionField = {
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
            />
        ),
    };

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
        { name: 'status', label: t('status'), type: 'text', required: true, section: 'Student Information' },
        { name: 'gradeLevel', label: t('grade_level'), type: 'number', required: true, section: 'Student Information' },
        { name: 'contractEndDate', label: t('contract_end_date'), type: 'date', required: true, section: 'Student Information' },
        { name: 'notes', label: t('notes'), type: 'text', required: false, section: 'Student Information' },
        { name: 'availableDates', label: t('available_dates'), type: 'text', required: true, section: 'Student Information' },
        contractSelectionField,
        schoolTypeSelectionField,
        locationSelectionField,
        parentSelectionField,
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
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReusableForm
                fields={[...userFields, ...studentFields]}
                onSubmit={handleStudentSubmit}
                entityName="Student"
                entintyFunction="Add"
            />
        </Box>
    );
}
