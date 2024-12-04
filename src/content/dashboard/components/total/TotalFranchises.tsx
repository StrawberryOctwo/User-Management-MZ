import {
  Link,
  CardContent,
  Avatar,
  Box,
  Typography,
  ListItemAvatar,
  Card,
  ListItemText,
  ListItem,
  styled,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { useEffect, useState } from 'react';
import { fetchFranchises } from 'src/services/franchiseService';

const AvatarError = styled(Avatar)(
  ({ theme }) => `
      background-color: ${theme.colors.error.main};
      color: ${theme.palette.getContrastText(theme.colors.error.main)};
      width: ${theme.spacing(8)};
      height: ${theme.spacing(8)};
      box-shadow: ${theme.colors.shadows.error};
`
);

const CardContentWrapper = styled(CardContent)(
  ({ theme }) => `
     padding: ${theme.spacing(2.5, 3, 3)};
  
     &:last-child {
     padding-bottom: 0;
     }
`
);

function TotalFranchises() {
  const { t } = useTranslation();
  const [selectedFranchise, setSelectedFranchise] = useState('All Franchises');
  const [totalFranchises, setTotalFranchises] = useState(0);
  const [franchises, setFranchises] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleFranchiseChange = (event) => {
    setSelectedFranchise(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all franchises
      const data = await fetchFranchises(page, limit);
      console.log(data);
      // Set totalFranchises to the length of the data
      setFranchises(data.data);
      setTotalFranchises(data.total);
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardContentWrapper>
        {/* <Typography variant="overline" color="text.primary">
          {t('Franchises')}
        </Typography> */}
        <FormControl
          variant="outlined"
          sx={{ minWidth: '150px', maxHeight: '50px' }}
        >
          <Select value={selectedFranchise} onChange={handleFranchiseChange}>
            <MenuItem value="All Franchises">All Franchises</MenuItem>
            {franchises.map((franchise) => (
              <MenuItem key={franchise.id} value={franchise.name}>
                {franchise.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ListItem
          disableGutters
          sx={{
            my: 1
          }}
          component="div"
        >
          <ListItemAvatar>
            <AvatarError variant="rounded">
              <BusinessTwoToneIcon fontSize="large" />
            </AvatarError>
          </ListItemAvatar>

          <Box display="flex" alignItems="center">
            <ListItemText
              primary={totalFranchises}
              primaryTypographyProps={{
                variant: 'h1',
                sx: {
                  ml: 2
                },
                noWrap: true
              }}
            />
          </Box>
        </ListItem>
        <ListItem
          disableGutters
          sx={{
            mt: 0.5,
            mb: 1.5
          }}
          component="div"
        >
          <ListItemText
            primary={
              <>
                <Link fontWeight="bold" href="/management/franchises">
                  {t('See all franchises')}
                </Link>
              </>
            }
            primaryTypographyProps={{ variant: 'body2', noWrap: true }}
          />
        </ListItem>
      </CardContentWrapper>
    </Card>
  );
}

export default TotalFranchises;
