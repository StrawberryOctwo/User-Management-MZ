import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { t } from 'i18next';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { addParent } from 'src/services/parentService';

const CreateParent = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Record<string, any>): Promise<{ message: string }> => {
    setLoading(true);
    try {
      // Structure payload to include both user and parent data
      const payload = {
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
          dob: data.dob,
          address: data.address,
          postalCode: data.postalCode,
        },
        parent: {
          accountHolder: data.accountHolder,
          iban: data.iban,
          bic: data.bic,
        },
      };

      const response = await addParent(payload); // Pass the structured payload
      return response;
    } catch (error: any) {
      console.error("Error adding parent:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Parent Data fields
  const parentFields: FieldConfig[] = [
    { name: 'firstName', label: t('first_name'), type: 'text', required: true, section: 'Parent Information' },
    { name: 'lastName', label: t('last_name'), type: 'text', required: true, section: 'Parent Information' },
    { name: 'email', label: t('email'), type: 'email', required: true, section: 'Parent Information' },
    { name: 'password', label: t('password'), type: 'password', required: true, section: 'Parent Information' },
    { name: 'dob', label: t('dob'), type: 'date', required: true, section: 'Parent Information' },
    { name: 'address', label: t('address'), type: 'text', required: true, section: 'Parent Information' },
    { name: 'postalCode', label: t('postal_code'), type: 'text', required: true, section: 'Parent Information' },
    { name: 'phoneNumber', label: t('phone_number'), type: 'text', required: true, section: 'Parent Information' },
    { name: 'accountHolder', label: t('account_holder'), type: 'text', required: true, section: 'Banking Information' },
    { name: 'iban', label: t('iban'), type: 'text', required: true, section: 'Banking Information' },
    { name: 'bic', label: t('bic'), type: 'text', required: false, section: 'Banking Information' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ReusableForm
        fields={parentFields}
        onSubmit={handleSubmit}
        entityName="Parent"
        entintyFunction='Add'
      />
    </Box>
  );
};

export default CreateParent;
