import { Grid, Typography, Avatar, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from 'src/hooks/useAuth';

function PageHeader() {
  const { t } = useTranslation();
  const { username } = useAuth();
  const theme = useTheme();

  return (
    <Grid container alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          {t('Welcome')}, {username}!
        </Typography>
        <Typography variant="subtitle2">
          {t('These are your analytics stats for today')},{' '}
          <b>{format(new Date(), 'MMMM dd yyyy')}</b>
        </Typography>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
