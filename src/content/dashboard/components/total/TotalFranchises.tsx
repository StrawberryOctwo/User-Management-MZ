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
  Select,
  CircularProgress
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
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);

  const handleFranchiseChange = (event) => {
    setSelectedFranchise(event.target.value);
  };

  const fetchMoreFranchises = async () => {
    setLoading(true);
    const data = await fetchFranchises(page, limit);
    setFranchises((prevFranchises) => [...prevFranchises, ...data.data]);
    setTotalFranchises(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchMoreFranchises();
  }, [page]);

  const handleScroll = (event) => {
    console.log('Scroll event detected');
    const bottom =
      event.target.scrollHeight - event.target.scrollTop ===
      event.target.clientHeight;
    if (bottom && !loading) {
      console.log('Reached bottom, loading more...');
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <Card>
      <CardContentWrapper>
        {/* <Typography variant="overline" color="text.primary">
          {t('Franchises')}
        </Typography> */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <Select
            value={selectedFranchise}
            onChange={handleFranchiseChange}
            MenuProps={{
              PaperProps: {
                onScroll: handleScroll,
                sx: {
                  maxHeight: 500,
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555'
                  }
                }
              }
            }}
          >
            <MenuItem value="All Franchises">All Franchises</MenuItem>
            {franchises.map((franchise) => (
              <MenuItem key={franchise.id} value={franchise.name}>
                {franchise.name}
              </MenuItem>
            ))}
            {loading && (
              <MenuItem disabled>
                <CircularProgress size={24} />
              </MenuItem>
            )}
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
