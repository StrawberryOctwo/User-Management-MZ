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
import {
  assignStudentToContract,
  fetchContractPackagesByEntity
} from 'src/services/contractPackagesService';
import { fetchSchoolTypes } from 'src/services/schoolTypeService';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid
} from '@mui/material';
import { daysOfWeek } from './utils';

export default function CreateStudent() {
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]); // Update to handle multiple IDs
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null
  );
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | null>(
    null
  );
  const [selectedSchoolTypeId, setSelectedSchoolTypeId] = useState<
    number | null
  >(null);

  const [studentData, setStudentData] = useState<Record<string, any> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<any>(null);
  const { showMessage } = useSnackbar();
  const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Grade ${i + 1}`
  }));

  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedDays((prev) =>
      checked ? [...prev, value] : prev.filter((day) => day !== value)
    );
  };

  const handleSelectAll = () => {
    setSelectedDays(daysOfWeek.map((day) => day.value));
  };

  const handleClearAll = () => {
    setSelectedDays([]);
  };

  const handleLocationSelect = (locations: any[]) => {
    setSelectedLocationIds(locations.map((location) => location.id));
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
  const handleStudentSubmit = async (
    data: Record<string, any>
  ): Promise<{ message: string }> => {
    if (selectedLocationIds.length === 0) {
      showMessage('Location field is required', 'error');
      return;
    }
    if (selectedTopics.length === 0) {
      showMessage("Topics field can't be empty", 'error');
      return;
    }

    setLoading(true);
    try {
      const topicIds = selectedTopics.map((topic) => topic.id);

      const payload = {
        student: {
          status: data['status'],
          gradeLevel: selectedGradeLevel,
          contract: data['contract'],
          contractEndDate: data['contractEndDate'],
          notes: data['notes'],
          availableDates: selectedDays,
          locationIds: selectedLocationIds,
          schoolType: selectedSchoolTypeId
        },
        user: {
          firstName: data['firstName'],
          lastName: data['lastName'],
          dob: data['dob'],
          email: data['email'],
          password: data['password'],
          city: data['city'],
          address: data['address'],
          postalCode: data['postalCode'],
          phoneNumber: data['phoneNumber']
        }
      };

      const response = await addStudent(payload);
      await assignStudentToTopics(response.studentId, topicIds);
      await assignStudentToContract(response.studentId, selectedContractId);

      const userId = response.userId;
      for (const file of uploadedFiles) {
        const documentPayload = {
          type: file.fileType,
          customFileName: file.fileName,
          userId: userId
        };
        await addDocument(documentPayload, file.file);
      }

      setSelectedLocationIds([]);
      setSelectedContractId(null);
      setSelectedTopics([]);
      setUploadedFiles([]);
      setSelectedSchoolTypeId(null);
      if (dropdownRef.current) dropdownRef.current.reset();

      return response;
    } catch (error: any) {
      console.error('Error adding student:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGradeLevelSelect = (selectedGrade: any) => {
    // Update the form data directly instead of using separate state
    console.log('selectedGrade:', selectedGrade);
    setSelectedGradeLevel(selectedGrade.id);
    return selectedGrade ? selectedGrade.id : null;
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
    )
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
          fetchContractPackagesByEntity(1, 5, query).then((data) => data.data)
        }
        onSelect={handleContractSelect}
        displayProperty="name"
        placeholder="Type to search contracts"
      />
    )
  };
  const locationSelectionField = {
    name: 'locations',
    label: t('Locations'),
    type: 'custom',
    section: 'Student Assignment',
    component: (
      <MultiSelectWithCheckboxes
        label="Search Location"
        fetchData={(query) =>
          fetchLocations(1, 5, query).then((data) => data.data)
        }
        onSelect={handleLocationSelect}
        displayProperty="name"
        placeholder="Type to search location"
      />
    )
  };

  const statusOptions = [
    { label: t('active'), value: 'active' },
    { label: t('inactive'), value: 'inactive' },
    { label: t('interested'), value: 'interested' }
  ];

  const userFields: FieldConfig[] = [
    {
      name: 'firstName',
      label: t('first_name'),
      type: 'text',
      required: true,
      section: 'User Information'
    },
    {
      name: 'lastName',
      label: t('last_name'),
      type: 'text',
      required: true,
      section: 'User Information'
    },
    {
      name: 'dob',
      label: t('dob'),
      type: 'date',
      required: true,
      section: 'User Information'
    },
    {
      name: 'email',
      label: t('email'),
      type: 'email',
      required: true,
      section: 'User Information'
    },
    {
      name: 'password',
      label: t('password'),
      type: 'password',
      required: true,
      section: 'User Information'
    },
    {
      name: 'city',
      label: t('city'),
      type: 'text',
      required: true,
      section: 'User Information'
    },
    {
      name: 'address',
      label: t('address'),
      type: 'text',
      required: true,
      section: 'User Information'
    },
    {
      name: 'postalCode',
      label: t('postal_code'),
      type: 'text',
      required: true,
      section: 'User Information'
    },
    {
      name: 'phoneNumber',
      label: t('phone_number'),
      type: 'number',
      required: true,
      section: 'User Information'
    }
  ];

  const studentFields = [
    {
      name: 'status',
      label: t('status'),
      type: 'select',
      required: true,
      section: 'Student Information',
      options: statusOptions
    },
    {
      name: 'gradeLevel',
      label: t('grade_level'),
      type: 'custom',
      required: true,
      section: 'Student Information',
      component: (
        <SingleSelectWithAutocomplete
          label="Select Grade Level"
          fetchData={() => Promise.resolve(gradeOptions)}
          onSelect={handleGradeLevelSelect}
          displayProperty="name"
          placeholder="Select Grade"
          initialValue={null}
          ref={dropdownRef}
        />
      ),
      getValue: (selectedValue: any) => selectedValue // Add this line
    },
    {
      name: 'contractEndDate',
      label: t('contract_end_date'),
      type: 'date',
      required: false,
      section: 'Student Information'
    },
    {
      name: 'notes',
      label: t('notes'),
      type: 'text',
      required: false,
      section: 'Student Information'
    },

    contractSelectionField,
    schoolTypeSelectionField,
    {
      name: 'availableDates',
      label: t('available_dates'),
      type: 'custom',
      required: true,
      section: 'Student Information',
      component: (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
            marginLeft: 5
          }}
        >
          <FormLabel component="legend" sx={{ whiteSpace: 'nowrap' }}>
            Available Days:
          </FormLabel>
          <FormGroup row sx={{ flexWrap: 'nowrap', gap: 2 }}>
            {daysOfWeek.map((day) => (
              <FormControlLabel
                key={day.value}
                control={
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onChange={handleDayChange}
                    value={day.value}
                  />
                }
                label={day.label}
                sx={{ width: 'auto' }} // Adjust width to fit content
              />
            ))}
          </FormGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" size="small" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      )
    },
    locationSelectionField,
    {
      name: 'topics',
      label: 'Assign Topics',
      type: 'custom',
      section: 'Student Assignment',
      component: (
        <MultiSelectWithCheckboxes
          label={t('Search_and_assign_topics')}
          fetchData={(query) =>
            fetchTopics(1, 5, query, 'name').then((data) => data.data)
          }
          onSelect={handleTopicSelect}
          displayProperty="name"
          placeholder="Type to search topics"
        />
      )
    },
    {
      name: 'documents',
      label: 'Upload Documents',
      type: 'custom',
      section: 'Documents',
      component: <UploadSection onUploadChange={handleFilesChange} />,
      xs: 12,
      sm: 12
    }
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
