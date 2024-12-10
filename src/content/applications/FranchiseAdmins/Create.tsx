import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';

import { addFranchiseAdmin } from 'src/services/franchiseAdminService';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchFranchises } from 'src/services/franchiseService';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { useTranslation } from 'react-i18next';
import PostalCodeInput from 'src/utils/PostalCodeInput';

export default function CreateFranchiseAdmin() {
  const [selectedFranchises, setSelectedFranchises] = useState<any[]>([]);
  const dropdownRef = useRef<any>(null);
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const handleFranchiseSelect = (selectedItems: any[]) => {
    setSelectedFranchises(selectedItems);
  };

  const handleAdminSubmit = async (
    data: Record<string, any>
  ): Promise<{ message: string }> => {
    setLoading(true);

    try {
      if (selectedFranchises.length === 0) {
        throw new Error('Please select at least one franchise.');
      }

      const franchiseIds = selectedFranchises.map((franchise) => franchise.id);

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        dob: data.dob,
        city: data.city,
        address: data.address,
        postalCode: postalCode,
        phoneNumber: data.phoneNumber,
        franchiseIds: franchiseIds
      };

      const response = await addFranchiseAdmin(payload);

      setSelectedFranchises([]);
      if (dropdownRef.current) {
        dropdownRef.current.reset();
      }

      setTimeout(() => {
        window.location.reload();
      }, 1500);
      return response;
    } catch (error: any) {
      console.error('Error adding Franchise Admin:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminFields: FieldConfig[] = [
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
      name: 'dob',
      label: t('dob'),
      type: 'date',
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
      type: 'custom',
      required: true,
      section: 'User Information',
      component: (
        <PostalCodeInput
          value={postalCode}
          onChange={setPostalCode}
          required
          sx={{ width: '95%' }}
        />
      )
    },
    {
      name: 'phoneNumber',
      label: t('phone_Number'),
      type: 'number',
      required: true,
      section: 'User Information'
    }
  ];

  const otherFields = [
    {
      name: 'franchises',
      label: t('franchises'),
      type: 'custom',
      section: 'Franchise Admin Assignment',
      component: (
        <MultiSelectWithCheckboxes
          ref={dropdownRef}
          label={t('search_and_assign_franchises')}
          fetchData={(query) =>
            fetchFranchises(1, 5, query).then((data) => data.data)
          }
          onSelect={handleFranchiseSelect}
          displayProperty="name"
          placeholder={t('type_to_search_franchises')}
        />
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ReusableForm
        fields={[...adminFields, ...otherFields]}
        onSubmit={handleAdminSubmit}
        entityName="Franchise Admin"
        entintyFunction="Add"
      />
    </Box>
  );
}
