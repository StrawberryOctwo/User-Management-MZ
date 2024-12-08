import { Box, Grid } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import { useAuth } from 'src/hooks/useAuth';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchFranchises } from 'src/services/franchiseService';
import {
  fetchLocationsByFranchise,
  fetchLocations
} from 'src/services/locationService';
import { useHeaderMenu } from 'src/components/Calendar/Components/CustomizedCalendar/HeaderMenuContext';
import { useTranslation } from 'react-i18next';

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
    selectedFranchise
  );
  const { t } = useTranslation();
  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const hasFranchiseAccess =
    strongestRoles.includes('SuperAdmin') ||
    strongestRoles.includes('FranchiseAdmin');
  const isLocationAdmin = strongestRoles.includes('LocationAdmin');
  const locationRef = useRef<any>(null);

  useEffect(() => {
    setIsLocationEnabled(selectedFranchise || isLocationAdmin);
  }, [selectedFranchise, isLocationAdmin]);

  const handleFranchiseChange = (franchise: any) => {
    setFranchiseId(franchise?.id || null);
    setIsLocationEnabled(!!franchise?.id || isLocationAdmin);
    setSelectedLocations([]);

    if (locationRef.current) {
      locationRef.current.reset();
    }

    if (franchise) {
      localStorage.setItem('selectedFranchise', JSON.stringify(franchise));
      setSelectedFranchise(franchise);
    } else {
      setSelectedFranchise(null); // Change from [] to null
      localStorage.removeItem('selectedFranchise');
      localStorage.removeItem('selectedLocations');
    }
  };

  const handleLocationsChange = (locations: any[]) => {
    if (locations.length > 0) {
      localStorage.setItem('selectedLocations', JSON.stringify(locations));
      console.log("these locations ", locations)
      setSelectedLocations(locations);
    } else {
      setSelectedLocations([]);
      localStorage.removeItem('selectedLocations');
    }

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
          fetchData={(query) => {
            if (hasFranchiseAccess && franchiseId) {
              return fetchLocationsByFranchise(franchiseId, query).then(
                (data) => {
                  if (data?.length > 0) {
                    console.log(data)
                    return data
                  }
                  return []

                }
              );
            } else if (!hasFranchiseAccess) {
              return fetchLocations(1, 5, query).then(
                (response) => response.data
              );
            }
          }}
          onSelect={handleLocationsChange}
          displayProperty="name"
          placeholder="Type to search locations"
          initialValue={selectedLocations}
          width="100%"
          disabled={!isLocationEnabled}
        />
      </Grid>
    </Grid>
  );
};

export default HeaderMenu;
