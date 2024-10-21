import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import { fetchFranchises } from 'src/services/franchiseService';
import { fetchLocationsByFranchise, fetchLocations } from 'src/services/locationService';


interface FilterToolbarProps {
  onFranchiseChange: (franchise: any) => void;
  onLocationChange: (location: any) => void;
  selectedFranchise: any | null;
  selectedLocation: any | null;
  userRole?: string;
}

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  onFranchiseChange,
  onLocationChange,
  selectedFranchise,
  selectedLocation,
  userRole,
}) => {
  const [franchiseId, setFranchiseId] = useState<number | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(!!selectedFranchise);
  const { userRoles } = useAuth(); // Get user roles from custom hook
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

  const handleLocationChange = (location: any) => {
    onLocationChange(location);
  };

  if (userRole === 'Teacher' || userRole === 'Student') {
    return null;
  }

  return (
<Box sx={{ mb: 2, mt: 3 }}>
  <Grid container spacing={2}>
    {hasFranchiseAccess && ( // Conditionally show Franchise field
      <Grid item xs={12} sm={2} sx={{ ml: 2 }}> {/* Add margin-left here */}
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
    <Grid item xs={12} sm={2} sx={{ ml: 2 }}> {/* Add margin-left here */}
      <SingleSelectWithAutocomplete
        label="Select Location"
        fetchData={(query) => {
          if (hasFranchiseAccess && franchiseId) {
            return fetchLocationsByFranchise(franchiseId, query).then((data) => data);
          } else {
            return fetchLocations(1, 5, query).then((response) => response.data);
          }
        }}
        onSelect={handleLocationChange}
        displayProperty="name"
        placeholder="Search Location"
        initialValue={selectedLocation}
      />
    </Grid>
  </Grid>
</Box>

  );
};

export default FilterToolbar;
