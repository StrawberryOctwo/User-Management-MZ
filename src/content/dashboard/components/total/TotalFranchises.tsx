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
  MenuItem,
  Select,
  CircularProgress,
  InputLabel,
} from '@mui/material';
import { useDashboard } from 'src/contexts/DashboardContext';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';

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
  const { counts, selectedFranchise, setSelectedFranchise, franchises, loadingCounts } = useDashboard();

  const handleFranchiseChange = (event) => {
    setSelectedFranchise(event.target.value);
  };
const FilterContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: flex-end;
    padding: ${theme.spacing(2)};
  `
);

  return (
    <Card>
      <CardContentWrapper>
      <FilterContainer>
        <FormControl variant="outlined" size="small">
        <InputLabel id="filter-label">Franchise</InputLabel>

          <Select
            labelId="filter-label"
            id="filter-select"
            value={selectedFranchise}
            onChange={handleFranchiseChange}
            label="Franchise"
          >
            <MenuItem value="All Franchises">All Franchises</MenuItem>
            {franchises.map((franchise) => (
              <MenuItem key={franchise.id} value={franchise.id}>
                {franchise.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </FilterContainer>
        <ListItem
          disableGutters
          sx={{ my: 1 }}
          component="div"
        >
          <ListItemAvatar>
            <AvatarError variant="rounded">
              <BusinessTwoToneIcon fontSize="large" />
            </AvatarError>
          </ListItemAvatar>
          <Box display="flex" alignItems="center">
            <ListItemText
              primary={loadingCounts ? <CircularProgress size={24} /> : counts.franchises}
              primaryTypographyProps={{
                variant: 'h1',
                sx: { ml: 2 },
                noWrap: true,
              }}
            />
          </Box>
        </ListItem>
        <ListItem
          disableGutters
          sx={{ mt: 0.5, mb: 1.5 }}
          component="div"
        >
          <ListItemText
            primary={
              <Link fontWeight="bold" href="/management/franchises">
                See all franchises
              </Link>
            }
            primaryTypographyProps={{ variant: 'body2', noWrap: true }}
          />
        </ListItem>
      </CardContentWrapper>
    </Card>
  );
}

export default TotalFranchises;
