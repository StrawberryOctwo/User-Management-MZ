import React from 'react';
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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

function SessionsByCity() {
  const { t } = useTranslation();
  const {
    sessionAnalytics,
    analyticsFilter,
    setAnalyticsFilter,
    loadingAnalytics
  } = useDashboard();

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
                value={analyticsFilter}
                onChange={(event) => setAnalyticsFilter(event.target.value)} // Update filter in context
                label="Filter"
              >
                <MenuItem value="day">{t("Day")}</MenuItem>
                <MenuItem value="week">{t("Week")}</MenuItem>
                <MenuItem value="month">{t("Month")}</MenuItem>
                <MenuItem value="year">{t("Year")}</MenuItem>
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
          {sessionAnalytics.map((item, index) => (
            <Grow in key={item.locationId} timeout={(index + 1) * 300}>
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
                        {item.locationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Sessions: {item.totalSessions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Duration: {item.avgSessionDuration}
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
                {index < sessionAnalytics.length - 1 && <Divider />}
              </Box>
            </Grow>
          ))}
        </List>
      )}
    </Card>
  );
}

export default SessionsByCity;
