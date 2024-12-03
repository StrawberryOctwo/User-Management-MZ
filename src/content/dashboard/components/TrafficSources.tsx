import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import Chart from 'react-apexcharts';

import {
  Button,
  Card,
  Box,
  CardContent,
  CardHeader,
  Divider,
  Menu,
  MenuItem,
  CardActions,
  Grid,
  Typography,
  styled,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';

// Styled Components
const CardActionsWrapper = styled(CardActions)(
  ({ theme }) => `
      background-color: ${theme.colors.alpha.black[5]};
      padding: 0;
      display: block;
`
);

const TabsContainerWrapper = styled(CardContent)(
  ({ theme }) => `
      background-color: ${theme.colors.alpha.black[5]};
`
);

const EmptyResultsWrapper = styled('img')(
  ({ theme }) => `
      max-width: 100%;
      width: auto;
      height: ${theme.spacing(17)};
      margin-top: ${theme.spacing(2)};
`
);

// Static Data for Invoice Analytics
const staticInvoiceData = {
  totalIncome: 5000.0,
  totalExpense: 3000.0,
  newSessions: '66.67%', // Net Income Percentage
  avgSessionDuration: '01:06:40', // Net Income Duration (for demonstration)
  bounceRate: '40.00%', // Example metric
  sessions: 2000.0 // Could represent the number of invoices
};

function TrafficSources() {
  const { t } = useTranslation();
  const theme = useTheme();

  const periods = [
    {
      value: 'today',
      text: t('Today')
    },
    {
      value: 'yesterday',
      text: t('Yesterday')
    },
    {
      value: 'last_month',
      text: t('Last month')
    },
    {
      value: 'last_year',
      text: t('Last year')
    }
  ];

  // Replace existing data with static invoice data
  const data = {
    totalIncome: staticInvoiceData.totalIncome,
    totalExpense: staticInvoiceData.totalExpense,
    netIncomePercentage: staticInvoiceData.newSessions,
    netIncomeDuration: staticInvoiceData.avgSessionDuration,
    bounceRate: staticInvoiceData.bounceRate,
    totalInvoices: staticInvoiceData.sessions
  };

  const actionRef1 = useRef<HTMLButtonElement>(null);
  const [openPeriod, setOpenMenuPeriod] = useState(false);
  const [period, setPeriod] = useState('Select period');

  const [currentTab, setCurrentTab] = useState('income');

  // Update tabs to reflect invoice analytics
  const tabs = [
    { value: 'income', label: t('Income') },
    { value: 'expense', label: t('Expense') },
    { value: 'summary', label: t('Summary') },
    { value: 'net', label: t('Net Income') }
  ];

  const handleTabsChange = (_event: React.SyntheticEvent, value: string) => {
    setCurrentTab(value);
  };

  // Update chart options to match invoice analytics
  const chartOptions: ApexCharts.ApexOptions = {
    stroke: {
      curve: 'smooth' as 'smooth', // Correctly typed
      width: [0, 5]
    },
    theme: {
      mode: theme.palette.mode as 'light' | 'dark' // Correctly typed
    },
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    markers: {
      hover: {
        sizeOffset: 2
      },
      shape: 'circle' as 'circle', // Correctly typed
      size: 6,
      strokeWidth: 3,
      strokeOpacity: 1,
      strokeColors: [theme.colors.alpha.white[100]],
      colors: [theme.colors.error.main]
    },
    colors: [theme.colors.primary.main, theme.colors.error.main],
    fill: {
      opacity: 1
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '25%'
      }
    },
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    dataLabels: {
      enabled: false
    },
    grid: {
      strokeDashArray: 5,
      borderColor: theme.palette.divider
    },
    legend: {
      show: false
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      tickAmount: 6,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  };

  // Update chart data to reflect invoice analytics
  const chartData = [
    {
      name: 'Total Income',
      type: 'column',
      data: [2000, 1500, 1800, 2200, 2100, 2500, 2400, 2300, 2600, 2700, 2800, 2900]
    },
    {
      name: 'Total Expense',
      type: 'line',
      data: [1000, 800, 900, 1200, 1100, 1300, 1250, 1150, 1400, 1500, 1550, 1600]
    }
  ];

  return (
    <Card>
      <CardHeader
        action={
          <>
            <Button
              size="small"
              variant="outlined"
              ref={actionRef1}
              onClick={() => setOpenMenuPeriod(true)}
              endIcon={<ExpandMoreTwoToneIcon fontSize="small" />}
            >
              {period}
            </Button>
            <Menu
              disableScrollLock
              anchorEl={actionRef1.current}
              onClose={() => setOpenMenuPeriod(false)}
              open={openPeriod}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              {periods.map((_period) => (
                <MenuItem
                  key={_period.value}
                  onClick={() => {
                    setPeriod(_period.text);
                    setOpenMenuPeriod(false);
                  }}
                >
                  {_period.text}
                </MenuItem>
              ))}
            </Menu>
          </>
        }
        title={t('Invoice Analytics')}
      />
      <Divider />
      <TabsContainerWrapper>
        <Tabs
          onChange={handleTabsChange}
          value={currentTab}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </TabsContainerWrapper>
      <Divider
        sx={{
          display: { xs: 'none', sm: 'flex' }
        }}
      />
      <CardContent>
        {currentTab === 'income' && (
          <Chart
            options={chartOptions}
            series={chartData}
            type="line"
            height={306}
          />
        )}
        {currentTab === 'expense' && (
          <Chart
            options={chartOptions}
            series={chartData}
            type="line"
            height={306}
          />
        )}
        {currentTab === 'summary' && (
          <Box
            sx={{
              textAlign: 'center'
            }}
          >
            <EmptyResultsWrapper src="/static/images/placeholders/illustrations/1.svg" alt="No data" />
            <Typography
              align="center"
              variant="h4"
              fontWeight="normal"
              color="text.secondary"
              sx={{
                mt: 3
              }}
              gutterBottom
            >
              {t('There are no charts generated for Summary!')}
            </Typography>
            <Button
              variant="contained"
              sx={{
                my: 3
              }}
            >
              {t('Generate Chart')}
            </Button>
          </Box>
        )}
        {currentTab === 'net' && (
          <Box
            sx={{
              textAlign: 'center'
            }}
          >
            <EmptyResultsWrapper src="/static/images/placeholders/illustrations/1.svg" alt="No data" />
            <Typography
              align="center"
              variant="h4"
              fontWeight="normal"
              color="text.secondary"
              sx={{
                mt: 3
              }}
              gutterBottom
            >
              {t('There are no charts generated for Net Income!')}
            </Typography>
            <Button
              variant="contained"
              sx={{
                my: 3
              }}
            >
              {t('Generate Chart')}
            </Button>
          </Box>
        )}
      </CardContent>
      <Divider />
      <CardActionsWrapper>
        <Box>
          <Grid container alignItems="center">
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography align="center" variant="h3" gutterBottom>
                    €{data.totalIncome}
                  </Typography>
                  <Typography
                    align="center"
                    variant="body1"
                    color="text.secondary"
                  >
                    {t('Total Income')}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </Grid>
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography align="center" variant="h3" gutterBottom>
                    €{data.totalExpense}
                  </Typography>
                  <Typography
                    align="center"
                    variant="body1"
                    color="text.secondary"
                  >
                    {t('Total Expense')}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </Grid>
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography align="center" variant="h3" gutterBottom>
                    €{data.totalIncome - data.totalExpense}
                  </Typography>
                  <Typography
                    align="center"
                    variant="body1"
                    color={
                      data.totalIncome - data.totalExpense >= 0
                        ? 'success.main'
                        : 'error.main'
                    }
                  >
                    {t('Net Income')}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </Grid>
            {/* Additional Metrics (Optional) */}
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography align="center" variant="h3" gutterBottom>
                    {data.totalInvoices}
                  </Typography>
                  <Typography
                    align="center"
                    variant="body1"
                    color="text.secondary"
                  >
                    {t('Total Invoices')}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </Grid>
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography align="center" variant="h3" gutterBottom>
                    {data.netIncomePercentage}
                  </Typography>
                  <Typography
                    align="center"
                    variant="body1"
                    color="text.secondary"
                  >
                    {t('Net Income Percentage')}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </Grid>
          </Grid>
        </Box>
      </CardActionsWrapper>
    </Card>
  );
}

export default TrafficSources;
