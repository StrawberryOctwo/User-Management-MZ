// src/components/InvoiceAnalytics/InvoiceAnalytics.tsx

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
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
  Tab,
} from '@mui/material';
import ExpenseChart from './IncomeAnalytics/ExpenseChart';
import IncomeChart from './IncomeAnalytics/IncomeChart';
import NetIncomeChart from './IncomeAnalytics/NetIncomeChart';
import { InvoiceData, staticInvoiceData } from './IncomeAnalytics/satticInvoiceData';
import SummaryChart from './IncomeAnalytics/SummaryChart';

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

type TimeFrame = 'day' | 'month' | 'year';

function InvoiceAnalytics() {
  const { t } = useTranslation();
  const theme = useTheme();

  const periods = [
    { value: 'day', text: t('Day') },
    { value: 'month', text: t('Month') },
    { value: 'year', text: t('Year') },
  ];

  const [chartData, setChartData] = useState(staticInvoiceData.month); // Default to 'month'
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month'); // Default to 'month'
  const [currentTab, setCurrentTab] = useState<'income' | 'expense' | 'summary' | 'net'>('income');

  const actionRef = useRef<HTMLButtonElement>(null);
  const [openMenuPeriod, setOpenMenuPeriod] = useState(false);
  const [periodLabel, setPeriodLabel] = useState<string>(t('Month'));

  const handleTabsChange = (_event: React.SyntheticEvent, value: string) => {
    setCurrentTab(value as 'income' | 'expense' | 'summary' | 'net');
  };

  const handlePeriodSelect = (selectedPeriod: { value: string; text: string }) => {
    setTimeFrame(selectedPeriod.value as TimeFrame);
    setPeriodLabel(selectedPeriod.text);
    setOpenMenuPeriod(false);
    
    switch (selectedPeriod.value) {
      case 'day':
        setChartData(staticInvoiceData.day);
        break;
      case 'month':
        setChartData(staticInvoiceData.month);
        break;
      case 'year':
        setChartData(staticInvoiceData.year);
        break;
      default:
        setChartData(staticInvoiceData.month);
    }
  };

  // Determine categories based on time frame
  const getCategories = () => {
    switch (timeFrame) {
      case 'day':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'year':
        return ['Q1', 'Q2', 'Q3', 'Q4'];
      default:
        return [];
    }
  };

  const categories = getCategories();

  // Compute totals
  const totalIncome = chartData.income.reduce((acc, curr) => acc + curr, 0);
  const totalExpense = chartData.expense.reduce((acc, curr) => acc + curr, 0);
  const netIncome = totalIncome - totalExpense;
  const totalInvoices = chartData.totalInvoices; // Example calculation
  const netIncomePercentage = totalIncome ? (netIncome / totalIncome) * 100 : 0;

  return (
    <Card>
      <CardHeader
        action={
          <>
            <Button
              size="small"
              variant="outlined"
              ref={actionRef}
              onClick={() => setOpenMenuPeriod(true)}
              endIcon={<ExpandMoreTwoToneIcon fontSize="small" />}
            >
              {periodLabel}
            </Button>
            <Menu
              disableScrollLock
              anchorEl={actionRef.current}
              onClose={() => setOpenMenuPeriod(false)}
              open={openMenuPeriod}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {periods.map((_period) => (
                <MenuItem
                  key={_period.value}
                  onClick={() => handlePeriodSelect(_period)}
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
          <Tab value="income" label={t('Income')} />
          <Tab value="expense" label={t('Expense')} />
          <Tab value="summary" label={t('Summary')} />
          <Tab value="net" label={t('Net Income')} />
        </Tabs>
      </TabsContainerWrapper>
      <Divider
        sx={{
          display: { xs: 'none', sm: 'flex' },
        }}
      />
      <CardContent>
        {currentTab === 'income' && (
          <IncomeChart
            data={chartData.income}
            categories={categories}
            themeMode={theme.palette.mode}
            primaryColor={theme.palette.primary.main}
          />
        )}
        {currentTab === 'expense' && (
          <ExpenseChart
            data={chartData.expense}
            categories={categories}
            themeMode={theme.palette.mode}
            errorColor={theme.palette.error.main}
          />
        )}
        {currentTab === 'summary' && (
          <SummaryChart
            incomeData={chartData.income}
            expenseData={chartData.expense}
            categories={categories}
            themeMode={theme.palette.mode}
            primaryColor={theme.palette.primary.main}
            errorColor={theme.palette.error.main}
          />
        )}
        {currentTab === 'net' && (
          <NetIncomeChart
            netIncomeData={chartData.netIncome}
            categories={categories}
            themeMode={theme.palette.mode}
            successColor={theme.palette.success.main}
            errorColor={theme.palette.error.main}
          />
        )}
      </CardContent>
      <Divider />
      <CardActionsWrapper>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box p={3} textAlign="center">
                <Typography variant="h3" gutterBottom>
                  €{totalIncome.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('Total Income')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box p={3} textAlign="center">
                <Typography variant="h3" gutterBottom>
                  €{totalExpense.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('Total Expense')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box p={3} textAlign="center">
                <Typography variant="h3" gutterBottom>
                  €{netIncome.toLocaleString()}
                </Typography>
                <Typography
                  variant="body1"
                  color={
                    netIncome >= 0
                      ? 'success.main'
                      : 'error.main'
                  }
                >
                  {t('Net Income')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box p={3} textAlign="center">
                <Typography variant="h3" gutterBottom>
                  {netIncomePercentage.toFixed(2)}%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('Net Income Percentage')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box p={3} textAlign="center">
                <Typography variant="h3" gutterBottom>
                  {totalInvoices.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('Total Invoices')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardActionsWrapper>
    </Card>
  );
}

export default InvoiceAnalytics;
