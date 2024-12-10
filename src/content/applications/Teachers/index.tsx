import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Box } from '@mui/material';
import Footer from 'src/components/Footer';
import { t } from "i18next"
import RecentOrders from './RecentOrders';

function ApplicationsFranchises() {
  return (
    <>
      <Helmet>
        <title>Teachers - Applications</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Box sx={{ mx: 15, px: 0 }}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
          sx={{ mx: 0 }}
        >
          <Grid item xs={12}>
            <RecentOrders />
          </Grid>
        </Grid>
      </Box >
      <Footer />
    </>
  );
}

export default ApplicationsFranchises;
