import {
  CardHeader,
  Divider,
  Card,
  LinearProgress,
  List,
  ListItem,
  Box,
  Typography,
  styled,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
  Grow
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { useDashboard } from 'src/contexts/DashboardContext';

// Styled Components
const ImageWrapper = styled(Avatar)(
  ({ theme }) => `
    margin-right: ${theme.spacing(2)};
    background-color: ${theme.palette.primary.main};
    width: 40px;
    height: 40px;
  `
);

const LinearProgressWrapper = styled(LinearProgress)(
  ({ theme }) => `
    flex-grow: 1;
    margin-right: ${theme.spacing(1)};
    height: 10px;
    border-radius: 5px;
    transition: all 0.5s ease;
  `
);

const ListItemWrapper = styled(ListItem)(`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-radius: 8px;
  transition: background-color 0.3s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`);

const FilterContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: flex-end;
    padding: ${theme.spacing(2)};
  `
);

function StudentsByFilters() {
  const { t } = useTranslation();
  const {
    studentAnalytics,
    studentFilter,
    setStudentFilter,
    loadingAnalytics
  } = useDashboard();

  // Function to get filter-specific icons
  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'location':
        return <LocationCityIcon />;
      case 'class':
        return <ClassIcon />;
      case 'school':
        return <SchoolIcon />;
      default:
        return <LocationCityIcon />;
    }
  };

  return (
    <Card>
      <CardHeader
        title={t('Students by Filters')}
        action={
          <FilterContainer>
            <FormControl variant="outlined" size="small">
              <InputLabel id="filter-label">Filter</InputLabel>
              <Select
                labelId="filter-label"
                id="filter-select"
                value={studentFilter}
                onChange={(event) => setStudentFilter(event.target.value)} // Update filter in context
                label="Filter"
              >
                <MenuItem value="location">Location</MenuItem>
                <MenuItem value="class">Class</MenuItem>
                <MenuItem value="school">School</MenuItem>
              </Select>
            </FormControl>
          </FilterContainer>
        }
      />
      <Divider />
      {loadingAnalytics ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List disablePadding component="nav">
          {studentAnalytics.map((item, index) => (
            <Grow in key={item.id} timeout={(index + 1) * 300}>
              <Box>
                <ListItemWrapper>
                  <Box display="flex" alignItems="center" width="100%">
                    {/* Filter Icon */}
                    <Box mr={2}>
                      <ImageWrapper>
                        {getFilterIcon(studentFilter)}
                      </ImageWrapper>
                    </Box>

                    {/* Filter-specific Name */}
                    <Box>
                      <Typography
                        variant="h6"
                        color="text.primary"
                        noWrap
                        sx={{ minWidth: 100 }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Count: {item.count}
                      </Typography>
                    </Box>

                    {/* Progress Bar and Percentage */}
                    <Box display="flex" alignItems="center" flexGrow={1} ml={2}>
                      <LinearProgressWrapper
                        value={item.percentage}
                        color="primary"
                        variant="determinate"
                      />
                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{ minWidth: 40 }}
                      >
                        {item.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                </ListItemWrapper>
                {index < studentAnalytics.length - 1 && <Divider />}
              </Box>
            </Grow>
          ))}
        </List>
      )}
    </Card>
  );
}

export default StudentsByFilters;
