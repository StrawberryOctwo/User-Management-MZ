import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Helmet } from 'react-helmet-async';
import { Grid } from '@mui/material';
import AudienceOverview from './components/AudienceOverview';
import ConversionsAlt from './components/total/TotalStudents';
import PageHeader from './components/PageHeader';
import TopLandingPages from './components/TopLandingPages';
import TrafficSources from './components/TrafficSources';
import TotalFranchises from './components/total/TotalFranchises';
import TotalLocations from './components/total/TotalLocations';
import TotalTeachers from './components/total/TotalTeachers';
import TurnOverPieChart from './components/SessionsByCountry';
import Conversions from './components/Conversions';

function DashboardAnalytics() {
  return (
    <>
      <Helmet>
        <title>Analytics Dashboard</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Grid
        sx={{
          px: 4
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item lg={8} md={6} xs={12}>
          <Grid
            container
            spacing={4}
            direction="row"
            justifyContent="center"
            alignItems="stretch"
          >
            <Grid item sm={6} xs={12}>
              <TotalFranchises />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TotalLocations />
            </Grid>

            <Grid item sm={6} xs={12}>
              <TotalTeachers />
            </Grid>
            <Grid item sm={6} xs={12}>
              <ConversionsAlt />
            </Grid>
          </Grid>
        </Grid>
        <Grid item lg={4} md={6} xs={12}>
          <TurnOverPieChart />
        </Grid>
        <Grid item xs={12}>
          <TrafficSources />
        </Grid>
        <Grid item xs={12}>
          <AudienceOverview />
        </Grid>
        <Grid item md={5} xs={12}>
          <Conversions />
        </Grid>
        <Grid item md={7} xs={12}>
          <TopLandingPages />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

export default DashboardAnalytics;
