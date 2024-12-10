import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import UploadSection from 'src/components/Files/UploadDocuments';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import { fetchLocations } from 'src/services/locationService';
import {
  fetchStudentById,
  fetchStudentDocumentsById,
  updateStudent
} from 'src/services/studentService';
import { assignStudentToTopics, fetchTopics } from 'src/services/topicService';
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
import { daysOfWeek, decodeAvailableDates } from './utils';
import { useTranslation } from 'react-i18next';

const EditStudent = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [studentData, setStudentData] = useState<Record<string, any> | null>(
    null
  );
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]); // Changed to an array for multiple locations
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [selectedSchoolType, setSelectedSchoolType] = useState<any | null>(
    null
  );
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showMessage } = useSnackbar();

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
          city: fetchedData.user.city,
          address: fetchedData.user.address,
          postalCode: fetchedData.user.postalCode,
          phoneNumber: fetchedData.user.phoneNumber,
          contractEndDate: fetchedData.contractEndDate
            ? formatDateForInput(fetchedData.contractEndDate)
            : '',
        };

        setStudentData(flattenedData);
        setSelectedLocations(fetchedData.locations || []); // Set multiple locations
        setSelectedTopics(fetchedData.topics || []);
        setSelectedContract(fetchedData.contract);
        setSelectedSchoolType(fetchedData.schoolType);
        setSelectedDays(decodeAvailableDates(fetchedData.availableDates) || []);
      }

      const formattedDocuments = studentDocuments.documents.map((doc) => ({
        id: doc.id,
        fileName: doc.name,
        fileType: doc.type,
        file: null,
        path: doc.path
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
    setSelectedContract(contract);
  };
  const handleSchoolTypeSelect = (schoolType: any) =>
    setSelectedSchoolType(schoolType);

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

  const handleStudentSubmit = async (
    data: Record<string, any>
  ): Promise<{ message: string }> => {
    if (data.password && data.password !== data.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    if (selectedLocations.length === 0) {
      showMessage('At least one location must be selected', 'error');
      return;
    }
    if (selectedTopics.length === 0) {
      showMessage("Topics field can't be empty", 'error');
      return;
    }

    setLoading(true);
    try {
      const topicIds = selectedTopics.map((topic) => topic.id);
      const locationIds = selectedLocations.map((location) => location.id);

      const userPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        email: data.email,
        city: data.city,
        address: data.address,
        postalCode: data.postalCode,
        phoneNumber: data.phoneNumber,
        password: data.password
      };

      const studentPayload = {
        status: data.status,
        contractType: data.contractType,
        contractEndDate: data.contractEndDate,
        notes: data.notes,
        availableDates: selectedDays,
        gradeLevel: data.gradeLevel,
        locationIds,
        schoolType: selectedSchoolType?.id
      };


      const response = await updateStudent(
        Number(id),
        userPayload,
        studentPayload
      );
      await assignStudentToTopics(Number(id), topicIds);
      if (
        selectedContract &&
        (!studentData.contract ||
          selectedContract.id !== studentData.contract.id)
      ) {
        await assignStudentToContract(response.studentId, selectedContract.id);
      }
      const userId = response.userId;
      for (const file of uploadedFiles) {
        const documentPayload = {
          type: file.fileType,
          customFileName: file.fileName,
          userId: String(userId)
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
    name: `Grade ${i + 1}`
  }));
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
        initialValue={selectedSchoolType}
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
        label={t("search_contracts")}
        fetchData={(query) =>
          fetchContractPackagesByEntity(1, 5, query).then((data) => data.data)
        }
        onSelect={handleContractSelect}
        displayProperty="name"
        placeholder="Type to search contracts"
        initialValue={selectedContract}
      />
    )
  };

  const statusOptions = [
    { label: t('active'), value: 'active' },
    { label: t('inactive'), value: 'inactive' },
    { label: t('interested'), value: 'interested' },
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
    },
    {
      name: 'password',
      label: t('new_password'),
      type: 'password',
      required: false,
      section: 'Change Password'
    },
    {
      name: 'confirmPassword',
      label: t('confirm_password'),
      type: 'password',
      required: false,
      section: 'Change Password'
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
          fetchData={() => Promise.resolve(gradeOptions)} // Static data function
          onSelect={(selectedGrade) =>
            setStudentData((prevData) => ({
              ...prevData,
              gradeLevel: selectedGrade ? selectedGrade.id : null
            }))
          }
          displayProperty="name"
          placeholder={t("select_grade")}
          initialValue={
            studentData?.gradeLevel
              ? gradeOptions.find(
                (grade) => grade.id === studentData.gradeLevel
              )
              : null
          }
        />
      )
    },
    {
      name: 'contractEndDate',
      label: t('contract_end_date'),
      type: 'date',
      required: true,
      section: 'Student Information'
    },
    {
      name: 'notes',
      label: t('notes'),
      type: 'text',
      required: false,
      section: 'Student Information'
    },

    {
      name: 'locations',
      label: t('locations'),
      type: 'custom',
      section: 'Student Assignment',
      component: (
        <MultiSelectWithCheckboxes
          label={t("search_location")}
          fetchData={(query) =>
            fetchLocations(1, 5, query).then((data) => data.data)
          }
          onSelect={handleLocationSelect}
          displayProperty="name"
          placeholder="Type to search location"
          initialValue={selectedLocations}
        />
      )
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
                sx={{ width: 'auto' }} // Adjust width to fit content
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
        </Box>
      )
    },

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
          initialValue={selectedTopics}
        />
      )
    },
    {
      name: 'documents',
      label: t('uploaded_documents'),
      type: 'custom',
      section: 'Documents',
      component: (
        <UploadSection
          onUploadChange={handleFilesChange}
          initialDocuments={uploadedFiles}
        />
      ),
      xs: 12,
      sm: 12
    }
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
