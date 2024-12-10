import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import UploadSection from 'src/components/Files/UploadDocuments';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addDocument } from 'src/services/fileUploadService';
import {
  assignTeacherToLocations,
  fetchLocations
} from 'src/services/locationService';
import { addTeacher } from 'src/services/teacherService';
import { assignTeacherToTopics, fetchTopics } from 'src/services/topicService';
import { generateEmployeeNumber } from 'src/utils/teacherUtils';
import { TextField } from '@mui/material';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { useTranslation } from 'react-i18next';
import IbanInput from 'src/utils/IbanInput';

const CreateTeacher = () => {
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [iban, setIban] = useState('');
  const handleIbanChange = (value: string) => {
    setIban(value);
  };
  const { showMessage } = useSnackbar();
  const { t } = useTranslation();
  const handleGenerateEmployeeNumber = (formData: {
    firstName: string;
    lastName: string;
    dob: string;
  }) => {
    if (formData.firstName && formData.lastName && formData.dob) {
      const generatedEmployeeNumber = generateEmployeeNumber(
        formData.firstName,
        formData.lastName,
        formData.dob
      );
      setEmployeeNumber(generatedEmployeeNumber);
    } else {
      alert(
        'Please fill in First Name, Last Name, and Date of Birth before generating the employee number.'
      );
    }
  };

  const handleLocationSelect = (selectedItems: any[]) => {
    setSelectedLocations(selectedItems);
  };

  const handleTopicSelect = (selectedItems: any[]) => {
    setSelectedTopics(selectedItems);
  };

  const handleFilesChange = (files: any[]) => {
    setUploadedFiles(files);
  };

  const handleTeacherSubmit = async (
    data: Record<string, any>
  ): Promise<{ message: string }> => {
    if (selectedLocations.length == 0) {
      showMessage('Locations field is required', 'error');
      return;
    }
    if (selectedTopics.length == 0) {
      showMessage("Topics field can't be empty", 'error');
      return;
    }
    setLoading(true);
    try {
      const locationIds = selectedLocations.map((location) => location.id);
      const topicIds = selectedTopics.map((topic) => topic.id);

      const payload = {
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob,
          email: data.email,
          password: data.password,
          city: data.city,
          address: data.address,
          postalCode: data.postalCode,
          phoneNumber: data.phoneNumber
        },
        teacher: {
          status: data.status,
          employeeNumber: employeeNumber,
          idNumber: data.idNumber,
          taxNumber: data.taxNumber,
          contractStartDate: data.contractStartDate,
          contractEndDate: data.contractEndDate,
          hourlyRate: data.hourlyRate,
          rateMultiplier: data.rateMultiplier,
          sessionRateMultiplier: data.sessionRateMultiplier,
          bank: data.bank,
          iban: iban.replace(/\s+/g, ''), // Trim all whitespaces from IBAN
          bic: data.bic
        }
      };

      const response = await addTeacher(payload);
      await assignTeacherToLocations(response.teacherId, locationIds);
      await assignTeacherToTopics(response.teacherId, topicIds);

      const userId = response.userId;
      for (const file of uploadedFiles) {
        const documentPayload = {
          type: file.fileType,
          customFileName: file.fileName,
          userId: userId
        };
        await addDocument(documentPayload, file.file);
      }

      setSelectedLocations([]);
      setSelectedTopics([]);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return response;
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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

  const teacherFields = [
    {
      name: 'status',
      label: t('status'),
      type: 'select',
      required: true,
      section: 'Teacher Information',
      options: statusOptions
    },
    {
      name: 'hourlyRate',
      label: t('Hourly Rate'),
      type: 'number',
      required: true,
      section: 'Teacher Information'
    },
    {
      name: 'rateMultiplier',
      label: t('rateMultiplier'),
      type: 'number',
      required: true,
      section: 'Teacher Information'
    },
    {
      name: 'sessionRateMultiplier',
      label: t('sessionRateMultiplier'),
      type: 'number',
      required: true,
      section: 'Teacher Information'
    },
    {
      name: 'taxNumber',
      label: t('tax_number'),
      type: 'text',
      required: true,
      section: 'Teacher Information'
    },
    {
      name: 'employeeNumber',
      label: t('employee_number'),
      type: 'custom',
      required: true,
      section: 'Teacher Information',
      component: (
        <Box display="flex" alignItems="center" gap={1} sx={{ width: '95%' }}>
          <TextField
            label="employee_number *"
            value={employeeNumber}
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true
            }}
          />
          <Button
            variant="contained"
            onClick={() =>
              handleGenerateEmployeeNumber({
                firstName:
                  document.querySelector<HTMLInputElement>('[name="firstName"]')
                    ?.value || '',
                lastName:
                  document.querySelector<HTMLInputElement>('[name="lastName"]')
                    ?.value || '',
                dob:
                  document.querySelector<HTMLInputElement>('[name="dob"]')
                    ?.value || ''
              })
            }
            sx={{ height: '50px' }}
          >
            Generate
          </Button>
        </Box>
      )
    },
    {
      name: 'idNumber',
      label: t('id_number'),
      type: 'text',
      required: false,
      section: 'Teacher Information'
    },
    {
      name: 'contractStartDate',
      label: t('contract_start_date'),
      type: 'date',
      required: true,
      section: 'Teacher Information'
    },
    {
      name: 'contractEndDate',
      label: t('contract_end_date'),
      type: 'date',
      required: true,
      section: 'Teacher Information'
    },
    {
      name: 'bank',
      label: t('bank'),
      type: 'text',
      required: true,
      section: 'Bank Details'
    },
    {
      name: 'iban',
      label: t('iban'),
      type: 'custom',
      section: 'Bank Details',
      component: (
        <IbanInput
          label="IBAN"
          value={iban}
          onChange={handleIbanChange}
          required
          sx={{ width: '95%' }}
        />
      )
    },
    {
      name: 'bic',
      label: t('bic'),
      type: 'text',
      required: false,
      section: 'Bank Details'
    },
    {
      name: 'locations',
      label: t('locations'),
      type: 'custom',
      required: true,
      section: 'Teacher Assignment',
      component: (
        <MultiSelectWithCheckboxes
          label={t('Search_and_assign_locations')}
          fetchData={(query) =>
            fetchLocations(1, 5, query).then((data) => data.data)
          }
          onSelect={handleLocationSelect}
          displayProperty="name"
          placeholder="Type to search locations"
        />
      )
    },
    {
      name: 'topics',
      label: t('topics'),
      type: 'custom',
      section: 'Teacher Assignment',
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
      label: t('Upload Documents'),
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
        fields={[...userFields, ...teacherFields]}
        onSubmit={handleTeacherSubmit}
        entityName="Teacher"
        entintyFunction="Add"
      />
    </Box>
  );
};

export default CreateTeacher;
