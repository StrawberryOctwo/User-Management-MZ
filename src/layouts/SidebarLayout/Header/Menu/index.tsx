import { Box, Grid } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import { t } from 'i18next';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchFranchises } from 'src/services/franchiseService';
import {
  fetchLocationsByFranchise,
  fetchLocations
} from 'src/services/locationService';
import { useHeaderMenu } from 'src/components/Calendar/Components/CustomizedCalendar/HeaderMenuContext';

const HeaderMenu: React.FC = () => {
  const {
    selectedFranchise,
    setSelectedFranchise,
    selectedLocations,
    setSelectedLocations
  } = useHeaderMenu();

  const [franchiseId, setFranchiseId] = useState<number | null>(
    selectedFranchise?.id || null
  );
  const [isLocationEnabled, setIsLocationEnabled] = useState(
    !!selectedFranchise
  );
  const [locationOptions, setLocationOptions] = useState<any[]>([]); // Options for locations dropdown

  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const hasFranchiseAccess =
    strongestRoles.includes('SuperAdmin') ||
    strongestRoles.includes('FranchiseAdmin');
  const isLocationAdmin = strongestRoles.includes('LocationAdmin');
  const locationRef = useRef<any>(null);

  useEffect(() => {
    setIsLocationEnabled(!!selectedFranchise || isLocationAdmin);

    // Fetch locations whenever the franchise changes
    const fetchLocationsForFranchise = async () => {
      if (franchiseId) {
        try {
          const locations = await fetchLocationsByFranchise(franchiseId, '');
          setLocationOptions(locations);
        } catch (error) {
          console.error('Error fetching locations:', error);
          setLocationOptions([]);
        }
      } else {
        setLocationOptions([]);
      }
    };

    fetchLocationsForFranchise();
  }, [franchiseId, isLocationAdmin, selectedFranchise]);

  const handleFranchiseChange = (franchise: any) => {
    setFranchiseId(franchise?.id || null);
    setIsLocationEnabled(!!franchise?.id || isLocationAdmin);

    setSelectedLocations([]);
    if (locationRef.current) {
      locationRef.current.reset();
    }

    setSelectedFranchise(franchise);
  };

  const handleLocationsChange = (locations: any[]) => {
    setSelectedLocations(locations);
  };

  if (
    strongestRoles.includes('Teacher') ||
    strongestRoles.includes('Student') ||
    strongestRoles.includes('Parent')
  ) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {hasFranchiseAccess && (
        <Grid item xs={12} sm={12} md={3} sx={{ ml: 2, width: '100%' }}>
          <SingleSelectWithAutocomplete
            label="Select Franchise"
            fetchData={(query) =>
              fetchFranchises(1, 5, query).then((data) => data.data)
            }
            onSelect={handleFranchiseChange}
            displayProperty="name"
            placeholder="Search Franchise"
            initialValue={selectedFranchise}
          />
        </Grid>
      )}
      <Grid
        item
        xs={12}
        sm={12}
        md={3}
        sx={{ ml: 1, mr: 2, pl: 0, width: '100%' }}
      >
        <MultiSelectWithCheckboxes
          ref={locationRef}
          label={t('Search_and_assign_locations')}
          options={locationOptions}
          fetchData={(query) => {
            if (franchiseId) {
              return fetchLocationsByFranchise(franchiseId, query).then(
                (data) => data
              );
            } else {
              return fetchLocations(1, 5, query).then(
                (response) => response.data
              );
            }
          }}
          onSelect={handleLocationsChange}
          displayProperty="name"
          placeholder="Type to search locations"
          initialValue={[]}
          width="100%"
          disabled={!isLocationEnabled}
        />
      </Grid>
    </Grid>
  );
};

export default HeaderMenu;
