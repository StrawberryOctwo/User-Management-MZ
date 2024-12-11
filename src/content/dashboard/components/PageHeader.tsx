import {
  Grid,
  Typography,
  Avatar,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from 'src/hooks/useAuth';
import { useState } from 'react';
import SingleSelectWithAutocomplete from 'src/components/SearchBars/SingleSelectWithAutocomplete';
import { fetchFranchises } from 'src/services/franchiseService';

function PageHeader() {
  const { t } = useTranslation();
  const { username } = useAuth();
  const [selectedFranchise, setSelectedFranchise] = useState('');

  const handleFranchiseChange = (event) => {
    setSelectedFranchise(event.target.value);
  };

  const franchises = [
    { id: 1, name: 'Franchise 1' },
    { id: 2, name: 'Franchise 2' },
    { id: 3, name: 'Franchise 3' }
  ];

  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {t('Welcome')}, {username}!
        </Typography>
        <Typography variant="subtitle2">
          {t('These are your analytics stats for today')},{' '}
          <b>{format(new Date(), 'MMMM dd yyyy')}</b>
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 300, mt: 1 }}>
          <SingleSelectWithAutocomplete
            label="Select Franchise"
            fetchData={(query) =>
              fetchFranchises(1, 5, query).then((data) => data.data)
            }
            onSelect={handleFranchiseChange}
            displayProperty="name"
            placeholder="{t('search_franchise')}"
            initialValue={selectedFranchise}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
