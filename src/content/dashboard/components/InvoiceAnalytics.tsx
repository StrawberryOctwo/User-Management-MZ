// src/components/InvoiceAnalytics/InvoiceAnalytics.tsx

import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/lab';
import ExpenseChart from './IncomeAnalytics/ExpenseChart';
import IncomeChart from './IncomeAnalytics/IncomeChart';
import NetIncomeChart from './IncomeAnalytics/NetIncomeChart';
import SummaryChart from './IncomeAnalytics/SummaryChart';
import { useDashboard } from 'src/contexts/DashboardContext';

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

type TimeFrame = 'week' | 'month' | 'year' | 'custom';

function InvoiceAnalytics() {
  const { t } = useTranslation();
  const theme = useTheme();

  const periods = [
    { value: 'week', text: t('Week') },
    { value: 'month', text: t('Month') },
    { value: 'year', text: t('Year') },
    { value: 'custom', text: t('Custom') },
  ];

  const {
    invoiceAnalytics,
    invoiceFilter,
    setInvoiceFilter,
    loadingInvoices,
    filterParams,
    setFilterParams,
  } = useDashboard();

  const [timeFrame, setTimeFrame] = useState<TimeFrame>(invoiceFilter as TimeFrame);
  const [currentTab, setCurrentTab] = useState<'income' | 'expense' | 'summary' | 'net'>('income');

  const actionRef = useRef<HTMLButtonElement>(null);
  const [openMenuPeriod, setOpenMenuPeriod] = useState(false);
  const [periodLabel, setPeriodLabel] = useState<string>(t('Month'));

  // Additional states for invoiceFilter parameters
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Initialize default dates based on the current invoiceFilter
  useEffect(() => {
    const now = new Date();
    switch (invoiceFilter) {
      case 'week':
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        setSelectedMonth(firstDayOfWeek.getMonth() + 1);
        setSelectedYear(firstDayOfWeek.getFullYear());
        break;
      case 'month':
        setSelectedMonth(now.getMonth() + 1);
        setSelectedYear(now.getFullYear());
        break;
      case 'year':
        setStartYear(2020); // Example start year
        setEndYear(now.getFullYear());
        break;
      case 'custom':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        break;
      default:
        break;
    }
  }, [invoiceFilter]);

  useEffect(() => {
    // Sync local timeFrame state with context invoiceFilter
    setTimeFrame(invoiceFilter as TimeFrame);
    const selectedPeriod = periods.find(p => p.value === invoiceFilter);
    if (selectedPeriod) {
      setPeriodLabel(selectedPeriod.text);
    }
  }, [invoiceFilter, periods, t]);

  const handleTabsChange = (_event: React.SyntheticEvent, value: string) => {
    setCurrentTab(value as 'income' | 'expense' | 'summary' | 'net');
  };

  const handlePeriodSelect = (selectedPeriod: { value: string; text: string }) => {
    setTimeFrame(selectedPeriod.value as TimeFrame);
    setPeriodLabel(selectedPeriod.text);
    setOpenMenuPeriod(false);
    setInvoiceFilter(selectedPeriod.value); // Update the context invoiceFilter

    // Reset invoiceFilter parameters when changing invoiceFilter
    setFilterParams({});
    setSelectedMonth(null);
    setSelectedYear(null);
    setStartYear(null);
    setEndYear(null);
    setStartDate(null);
    setEndDate(null);
  };

  // Memoize the new params to prevent unnecessary state updates
  const newParams = useMemo(() => {
    const params: any = {};

    switch (invoiceFilter) {
      case 'week':
        if (selectedMonth && selectedYear) {
          params.month = selectedMonth;
          params.year = selectedYear;
        }
        break;
      case 'month':
        if (selectedMonth && selectedYear) {
          params.month = selectedMonth;
          params.year = selectedYear;
        }
        break;
      case 'year':
        if (startYear && endYear) {
          params.startYear = startYear;
          params.endYear = endYear;
        }
        break;
      case 'custom':
        if (startDate && endDate) {
          params.startDate = startDate.toISOString().split('T')[0];
          params.endDate = endDate.toISOString().split('T')[0];
        }
        break;
      default:
        break;
    }

    return params;
  }, [invoiceFilter, selectedMonth, selectedYear, startYear, endYear, startDate, endDate]);

  // Compare newParams with current filterParams before setting
  useEffect(() => {
    const paramsString = JSON.stringify(newParams);
    const currentParamsString = JSON.stringify(filterParams);

    if (paramsString !== currentParamsString) {
      setFilterParams(newParams);
    }
  }, [newParams, filterParams, setFilterParams]);

  // Compute totals from invoiceAnalytics
  const totalIncome = useMemo(() => invoiceAnalytics.income.reduce((acc, curr) => acc + curr, 0), [invoiceAnalytics.income]);
  const totalExpense = useMemo(() => invoiceAnalytics.expense.reduce((acc, curr) => acc + curr, 0), [invoiceAnalytics.expense]);
  const netIncome = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const totalInvoices = useMemo(() => invoiceAnalytics.totalInvoices, [invoiceAnalytics.totalInvoices]);
  const netIncomePercentage = useMemo(() => (totalIncome ? ((netIncome / totalIncome) * 100).toFixed(2) : '0.00'), [netIncome, totalIncome]);

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
        {/* Additional invoiceFilter Parameters */}
        <Box mb={3}>
          {timeFrame === 'week' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="month-select-label">{t('Month')}</InputLabel>
                  <Select
                    labelId="month-select-label"
                    value={selectedMonth || ''}
                    label={t('Month')}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MuiMenuItem key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'short' })}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={t('Year')}
                  type="number"
                  fullWidth
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                />
              </Grid>
            </Grid>
          )}

          {timeFrame === 'month' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="month-select-label">{t('Month')}</InputLabel>
                  <Select
                    labelId="month-select-label"
                    value={selectedMonth || ''}
                    label={t('Month')}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MuiMenuItem key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'short' })}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={t('Year')}
                  type="number"
                  fullWidth
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                />
              </Grid>
            </Grid>
          )}

          {timeFrame === 'year' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={t('Start Year')}
                  type="number"
                  fullWidth
                  value={startYear || ''}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={t('End Year')}
                  type="number"
                  fullWidth
                  value={endYear || ''}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                />
              </Grid>
            </Grid>
          )}

          {timeFrame === 'custom' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label={t('Start Date')}
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  maxDate={endDate || undefined}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label={t('End Date')}
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Charts */}
        {loadingInvoices ? (
          <Typography variant="h6" align="center">
            {t('Loading...')}
          </Typography>
        ) : (
          <>
            {currentTab === 'income' && (
              <IncomeChart
                data={invoiceAnalytics.income}
                categories={invoiceAnalytics.periods}
                themeMode={theme.palette.mode}
                primaryColor={theme.palette.primary.main}
              />
            )}
            {currentTab === 'expense' && (
              <ExpenseChart
                data={invoiceAnalytics.expense}
                categories={invoiceAnalytics.periods}
                themeMode={theme.palette.mode}
                errorColor={theme.palette.error.main}
              />
            )}
            {currentTab === 'summary' && (
              <SummaryChart
                incomeData={invoiceAnalytics.income}
                expenseData={invoiceAnalytics.expense}
                categories={invoiceAnalytics.periods}
                themeMode={theme.palette.mode}
                primaryColor={theme.palette.primary.main}
                errorColor={theme.palette.error.main}
              />
            )}
            {currentTab === 'net' && (
              <NetIncomeChart
                netIncomeData={invoiceAnalytics.netIncome}
                categories={invoiceAnalytics.periods}
                themeMode={theme.palette.mode}
                successColor={theme.palette.success.main}
                errorColor={theme.palette.error.main}
              />
            )}
          </>
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
                  {netIncomePercentage}%
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
