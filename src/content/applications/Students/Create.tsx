// src/pages/CreateStudent.tsx
import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
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
  FormLabel
} from '@mui/material';
import { daysOfWeek } from './utils';
import { useTranslation } from 'react-i18next';
import AvailableTimePicker from './AvailableTimesPicker';

export default function CreateStudent() {
  const { t } = useTranslation();
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null
  );
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availableTime, setAvailableTime] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  }); // Add availableTime state
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | null>(
    null
  );
  const [selectedSchoolTypeId, setSelectedSchoolTypeId] = useState<number | null>(
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
    if (!availableTime.start || !availableTime.end) {
      showMessage('Available time must have both start and end times', 'error');
      return;
    }
    // Optional: Validate that start time is before end time
    if (availableTime.start >= availableTime.end) {
      showMessage('Start time must be before end time', 'error');
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
          availableTime: availableTime, // Include availableTime in payload
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
      if (selectedContractId) {
        await assignStudentToContract(response.studentId, selectedContractId);
      }

      const userId = response.userId;
      for (const file of uploadedFiles) {
        const documentPayload = {
          type: file.fileType,
          customFileName: file.fileName,
          userId: userId
        };
        await addDocument(documentPayload, file.file);
      }

      // Reset form fields
      setSelectedLocationIds([]);
      setSelectedContractId(null);
      setSelectedTopics([]);
      setUploadedFiles([]);
      setSelectedSchoolTypeId(null);
      setSelectedGradeLevel(null);
      setSelectedDays([]);
      setAvailableTime({ start: '', end: '' });
      if (dropdownRef.current) dropdownRef.current.reset();

      showMessage('Student added successfully', 'success');
      return response;
    } catch (error: any) {
      console.error('Error adding student:', error);
      showMessage('Error adding student', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGradeLevelSelect = (selectedGrade: any) => {
    setSelectedGradeLevel(selectedGrade ? selectedGrade.id : null);
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
    label: t('contracts'),
    type: 'custom',
    section: 'Student Information',
    component: (
      <SingleSelectWithAutocomplete
        label={t('search_contracts')}
        fetchData={(query) =>
          fetchContractPackagesByEntity(1, 5, query).then((data) => data.data)
        }
        onSelect={handleContractSelect}
        displayProperty="name"
        placeholder={t('type_to_search_contracts')}
      />
    )
  };
  const locationSelectionField = {
    name: 'locations',
    label: t('locations'),
    type: 'custom',
    section: 'Student Assignment',
    component: (
      <MultiSelectWithCheckboxes
        label={t('search_location')}
        fetchData={(query) =>
          fetchLocations(1, 5, query).then((data) => data.data)
        }
        onSelect={handleLocationSelect}
        displayProperty="name"
        placeholder={t('type_to_search_location')}
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

  const studentFields: FieldConfig[] = [
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
            {t('available_days')}:
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
                sx={{ width: 'auto' }}
              />
            ))}
          </FormGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" size="small" onClick={handleSelectAll}>
              {t('select_all')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleClearAll}
            >
              {t('clear_all')}
            </Button>
          </Box>
          {/* Add AvailableTimePicker */}
          <AvailableTimePicker
            availableTime={availableTime}
            setAvailableTime={setAvailableTime}
          />
        </Box>
      )
    },
    locationSelectionField,
    {
      name: 'topics',
      label: t('assign_topics'),
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
      label: t('upload_documents'),
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
