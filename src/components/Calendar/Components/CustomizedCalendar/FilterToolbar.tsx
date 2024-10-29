import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import { fetchFranchises } from 'src/services/franchiseService';
import { fetchLocationsByFranchise, fetchLocations } from 'src/services/locationService';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { t } from 'i18next';

interface FilterToolbarProps {
  onFranchiseChange: (franchise: any) => void;
  onLocationsChange: (locations: any[]) => void; // Updated to accept an array
  selectedFranchise: any | null;
  selectedLocations: any[] | null; // Updated to accept an array of locations
  userRole?: string;
}

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  onFranchiseChange,
  onLocationsChange,
  selectedFranchise,
  selectedLocations,
  userRole,
}) => {
  const [franchiseId, setFranchiseId] = useState<number | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(!!selectedFranchise);
  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const hasFranchiseAccess = strongestRoles.includes('SuperAdmin') || strongestRoles.includes('FranchiseAdmin');

  useEffect(() => {
    if (selectedFranchise) {
      setFranchiseId(selectedFranchise.id);
    }
  }, [selectedFranchise]);

  const handleFranchiseChange = (franchise: any) => {
    setFranchiseId(franchise?.id || null);
    setIsLocationEnabled(!!franchise?.id);
    onFranchiseChange(franchise);
  };

  const handleLocationsChange = (locations: any[]) => {
    onLocationsChange(locations); // Passes selected locations array to the parent
  };

  if (userRole === 'Teacher' || userRole === 'Student') {
    return null;
  }

  return (
    <Box sx={{ mb: 2, mt: 3 }}>
      <Grid container spacing={2}>
        {hasFranchiseAccess && (
          <Grid item xs={12} sm={12} md={3} sx={{ ml: 2 }}>
            <SingleSelectWithAutocomplete
              label="Select Franchise"
              fetchData={(query) => fetchFranchises(1, 5, query).then((data) => data.data)}
              onSelect={handleFranchiseChange}
              displayProperty="name"
              placeholder="Search Franchise"
              initialValue={selectedFranchise}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={12} md={3} sx={{ ml: 1, mr: 2, pl: 0 }}>
          <MultiSelectWithCheckboxes
            label={t('Search_and_assign_locations')}
            fetchData={(query) => {
              if (hasFranchiseAccess && franchiseId) {
                return fetchLocationsByFranchise(franchiseId, query).then((data) => data);
              } else {
                return fetchLocations(1, 5, query).then((response) => response.data);
              }
            }}
            onSelect={handleLocationsChange}  // Updated to handle multiple locations
            displayProperty="name"
            placeholder="Type to search locations"
            initialValue={selectedLocations}
            width="100%"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterToolbar;
