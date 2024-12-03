import React, { useEffect, useState } from 'react';
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
  Grow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationCityIcon from '@mui/icons-material/LocationCity';

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

const ListItemWrapper = styled(ListItem)(
  () => `
    display: flex;
    align-items: center;
    padding: 16px 24px;
    border-radius: 8px;
    transition: background-color 0.3s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `
);

const FilterContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: flex-end;
    padding: ${theme.spacing(2)};
  `
);

// SessionsByCity Component
function SessionsByCity() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  // Simulate data fetching based on filter
  useEffect(() => {
    const fetchData = () => {
      // Dummy data for different filters
      const dummyData = {
        day: [
          { id: 1, city: 'New York', percentage: 57, totalSessions: 120, avgSessionDuration: '5m 30s' },
          { id: 2, city: 'Berlin', percentage: 34, totalSessions: 80, avgSessionDuration: '4m 20s' },
          { id: 3, city: 'Paris', percentage: 21, totalSessions: 60, avgSessionDuration: '3m 50s' },
          { id: 4, city: 'Madrid', percentage: 13, totalSessions: 40, avgSessionDuration: '2m 45s' },
          { id: 5, city: 'Beijing', percentage: 71, totalSessions: 150, avgSessionDuration: '6m 10s' },
        ],
        week: [
          { id: 1, city: 'New York', percentage: 65, totalSessions: 840, avgSessionDuration: '5m 45s' },
          { id: 2, city: 'Berlin', percentage: 40, totalSessions: 560, avgSessionDuration: '4m 35s' },
          { id: 3, city: 'Paris', percentage: 25, totalSessions: 400, avgSessionDuration: '4m 00s' },
          { id: 4, city: 'Madrid', percentage: 15, totalSessions: 320, avgSessionDuration: '3m 15s' },
          { id: 5, city: 'Beijing', percentage: 80, totalSessions: 960, avgSessionDuration: '6m 30s' },
        ],
        month: [
          { id: 1, city: 'New York', percentage: 70, totalSessions: 3600, avgSessionDuration: '5m 50s' },
          { id: 2, city: 'Berlin', percentage: 45, totalSessions: 3000, avgSessionDuration: '4m 40s' },
          { id: 3, city: 'Paris', percentage: 30, totalSessions: 2400, avgSessionDuration: '4m 10s' },
          { id: 4, city: 'Madrid', percentage: 20, totalSessions: 1600, avgSessionDuration: '3m 30s' },
          { id: 5, city: 'Beijing', percentage: 85, totalSessions: 4200, avgSessionDuration: '6m 45s' },
        ],
        year: [
          { id: 1, city: 'New York', percentage: 75, totalSessions: 43200, avgSessionDuration: '6m 00s' },
          { id: 2, city: 'Berlin', percentage: 50, totalSessions: 24000, avgSessionDuration: '5m 00s' },
          { id: 3, city: 'Paris', percentage: 35, totalSessions: 28800, avgSessionDuration: '4m 20s' },
          { id: 4, city: 'Madrid', percentage: 25, totalSessions: 19200, avgSessionDuration: '3m 45s' },
          { id: 5, city: 'Beijing', percentage: 90, totalSessions: 50400, avgSessionDuration: '7m 00s' },
        ],
      };

      // Simulate network delay
      setTimeout(() => {
        setData(dummyData[filter]);
        setLoading(false);
      }, 1000);
    };

    setLoading(true);
    fetchData();
  }, [filter]);

  // Function to get medal icon based on rank
  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <Tooltip title="1st Place" arrow>
            <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 30 }} />
          </Tooltip>
        );
      case 2:
        return (
          <Tooltip title="2nd Place" arrow>
            <EmojiEventsIcon sx={{ color: '#C0C0C0', fontSize: 28 }} />
          </Tooltip>
        );
      case 3:
        return (
          <Tooltip title="3rd Place" arrow>
            <EmojiEventsIcon sx={{ color: '#CD7F32', fontSize: 26 }} />
          </Tooltip>
        );
      default:
        return (
          <Tooltip title={`Rank ${rank}`} arrow>
            <LocationCityIcon color="disabled" />
          </Tooltip>
        );
    }
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <Card>
      <CardHeader
        title={t('Sessions by City')}
        action={
          <FilterContainer>
            <FormControl variant="outlined" size="small">
              <InputLabel id="filter-label">Filter</InputLabel>
              <Select
                labelId="filter-label"
                id="filter-select"
                value={filter}
                onChange={handleFilterChange}
                label="Filter"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </FilterContainer>
        }
      />
      <Divider />
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List disablePadding component="nav">
          {data.map((item, index) => (
            <Grow in key={item.id} timeout={(index + 1) * 300}>
              <Box>
                <ListItemWrapper>
                  <Box display="flex" alignItems="center" width="100%">
                    {/* Ranking Icon */}
                    <Box mr={2}>{getMedalIcon(index + 1)}</Box>

                    {/* City Icon and Name */}
                    <ImageWrapper>
                      <LocationCityIcon />
                    </ImageWrapper>
                    <Box>
                      <Typography
                        variant="h6"
                        color="text.primary"
                        noWrap
                        sx={{ minWidth: 100 }}
                      >
                        {item.city}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Sessions: {item.totalSessions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Duration: {item.avgSessionDuration}
                      </Typography>
                    </Box>

                    {/* Progress Bar and Percentage */}
                    <Box
                      display="flex"
                      alignItems="center"
                      flexGrow={1}
                      ml={2}
                    >
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
                {index < data.length - 1 && <Divider />}
              </Box>
            </Grow>
          ))}
        </List>
      )}
    </Card>
  );
}

export default SessionsByCity;
