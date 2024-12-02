import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import { getStrongestRoles } from 'src/hooks/roleUtils';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchLocationsByFranchise } from 'src/services/locationService';
import { useHeaderMenu } from 'src/components/Calendar/Components/CustomizedCalendar/HeaderMenuContext';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchFranchises } from 'src/services/franchiseService';

interface Location {
  id: number;
  name: string;
  numberOfRooms: number;
}

const HeaderMenu: React.FC = () => {
  const {
    selectedFranchise,
    setSelectedFranchise,
    selectedLocations,
    setSelectedLocations
  } = useHeaderMenu();

  const { userRoles } = useAuth();
  const strongestRoles = userRoles ? getStrongestRoles(userRoles) : [];
  const hasFranchiseAccess = strongestRoles.includes('SuperAdmin') || strongestRoles.includes('FranchiseAdmin');
  const isLocationAdmin = strongestRoles.includes('LocationAdmin');

  const [franchiseId, setFranchiseId] = useState<number | null>(selectedFranchise?.id || null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(!!selectedFranchise);
  const [locations, setLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);  // Store all locations for the franchise
  const [isDisabled, setIsDisabled] = useState(false);  // Disable the location input if no franchise is selected

  const locationRef = useRef<any>(null);

  useEffect(() => {
    // Update whether locations should be enabled based on the selected franchise
    setIsLocationEnabled(!!selectedFranchise || isLocationAdmin);
  }, [selectedFranchise, isLocationAdmin]);

  useEffect(() => {
    const fetchLocationsList = async () => {
      if (franchiseId) {
        try {
          const locationData = await fetchLocationsByFranchise(franchiseId, '');
          setLocations(locationData);  // Set the locations for the selected franchise
        } catch (error) {
          console.error('Error fetching locations:', error);
          setLocations([]);  // If there's an error, clear locations
        }
      } else {
        setLocations([]);  // If no franchise is selected, clear locations
      }
    };

    fetchLocationsList();  // Call the function to fetch locations
  }, [franchiseId]);

  const handleFranchiseChange = (franchise: any) => {
    setFranchiseId(franchise?.id || null);
    setIsLocationEnabled(!!franchise?.id || isLocationAdmin);
    setSelectedLocations([]);  // Clear selected locations
    localStorage.setItem('selectedLocations', JSON.stringify([]));

    if (!franchise) {
      setAllLocations([]);  // Clear all locations if no franchise is selected
      setLocations([]);
      setSelectedFranchise(null);
      localStorage.removeItem('selectedFranchise');  // Clear franchise from localStorage
      return;
    }

    // Set the selected franchise
    setSelectedFranchise(franchise);
    localStorage.setItem('selectedFranchise', JSON.stringify(franchise));  // Store in localStorage
  };

  const handleLocationSelect = (selectedItems: Location[]) => {
    setSelectedLocations(selectedItems);  // Update selected locations
    localStorage.setItem('selectedLocations', JSON.stringify(selectedItems));  // Store selected locations in localStorage
  };

  // Disable UI for certain roles
  if (strongestRoles.includes('Teacher') || strongestRoles.includes('Student') || strongestRoles.includes('Parent')) {
    return null;  // If the user doesn't have access to see this, return null
  }

  // Handle fetching locations for the MultiSelect component based on the query
  const fetchLocationOptions = async (query: string) => {
    if (selectedFranchise) {
      try {
        const locations = await fetchLocationsByFranchise(selectedFranchise.id, query);
        return locations;
      } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
      }
    }
    return [];
  };

  // Effect to handle franchise selection change
  useEffect(() => {
    if (selectedFranchise) {
      // Fetch locations when a franchise is selected
      setIsDisabled(false);  // Enable locations input
      fetchLocationsByFranchise(selectedFranchise.id)
        .then((locations) => {
          setAllLocations(locations);  // Update all locations for the franchise
        })
        .catch((error) => {
          console.error('Error fetching locations:', error);
        });
    } else {
      // Disable the location input and clear selected locations if no franchise is selected
      setIsDisabled(true);
      setSelectedLocations([]);
      setAllLocations([]);  // Clear all locations
    }
  }, [selectedFranchise]);

  return (
    <Grid container spacing={2}>
      {hasFranchiseAccess && (
        <Grid item xs={12} sm={12} md={3} sx={{ ml: 2, width: '100%' }}>
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
      <Grid item xs={12} sm={12} md={3} sx={{ ml: 1, mr: 2, pl: 0, width: '100%' }}>
        <MultiSelectWithCheckboxes
          label="Locations"
          fetchData={fetchLocationOptions}
          onSelect={handleLocationSelect}
          displayProperty="name"
          initialValue={selectedLocations}
          placeholder="Select locations"
          disabled={isDisabled}  // Disable input if no franchise is selected
          width="100%"
        />
      </Grid>
    </Grid>
  );
};

export default HeaderMenu;
