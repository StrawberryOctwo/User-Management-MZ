import React, { useState } from 'react';
import Box from '@mui/material/Box';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import ReusableForm, { FieldConfig } from 'src/components/Table/tableRowCreate';
import { fetchFranchises } from 'src/services/franchiseService';
import { addTopic } from 'src/services/topicService';
import { useTranslation } from 'react-i18next';

const CreateTopic = () => {
  const [selectedFranchise, setSelectedFranchise] = useState<any>(null); // Store single selected franchise
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  // Handle franchise selection
  const handleFranchiseSelect = (selectedItem: any) => {
    setSelectedFranchise(selectedItem); // {t("save")} the single selected franchise
  };

  // Handle form submission
  const handleSubmit = async (
    data: Record<string, any>
  ): Promise<{ message: string }> => {
    setLoading(true);
    try {
      // Check if a franchise is selected
      const franchiseId = selectedFranchise?.id || null;

      if (!franchiseId) {
        throw new Error('Please select a franchise.');
      }

      // Prepare the payload for topic creation
      const payload = {
        name: data.name,
        franchiseId: franchiseId // Include the selected franchise ID
      };

      // Step 1: Create the topic
      const response = await addTopic(payload);

      // Reset form fields and franchise after successful submission
      setSelectedFranchise(null);

      return response;
    } catch (error: any) {
      console.error('Error adding topic:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Topic Data fields configuration
  const topicFields: FieldConfig[] = [
    {
      name: 'name',
      label: t('topic_name'),
      type: 'text',
      required: true,
      section: 'Topic Information',
      validation: {
        pattern: {
          value: /^[a-zA-Z0-9\s]{3,30}$/,
          message: 'Please enter a topic name between 3 and 30 characters.'
        }
      }
    }
  ];

  // Franchise Selection field configuration
  const franchiseField = [
    {
      name: 'franchise',
      label: t('franchise'),
      type: 'custom',
      section: 'Franchise Assignment',
      component: (
        <SingleSelectWithAutocomplete
          label={t('Search_and_assign_franchises')}
          fetchData={(query) =>
            fetchFranchises(1, 5, query).then((data) => data.data)
          }
          onSelect={handleFranchiseSelect}
          displayProperty="name"
          placeholder="Type to search franchises"
        />
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ReusableForm
        fields={[...topicFields, ...franchiseField]} // Merge both field arrays
        onSubmit={handleSubmit}
        entityName="Topic"
        entintyFunction="Add"
      />
    </Box>
  );
};

export default CreateTopic;
