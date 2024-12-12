import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MonetizationOnIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDashboard } from 'src/contexts/DashboardContext';
import Label from 'src/components/Label';

// Define a type for metric items
interface MetricItem {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  color?: 'success' | 'error' | 'info' | 'warning';
}

function DashboardMetrics() {
  const { t } = useTranslation();
  const {
    counts,
    invoiceAnalytics,
    sessionAnalytics,
    loadingCounts,
    loadingAnalytics,
    loadingInvoices,
    error,
  } = useDashboard();

  // Calculate additional metrics
  const studentTeacherRatio =
    counts.teachers > 0 ? (counts.students / counts.teachers).toFixed(2) : 'N/A';
  const incomePerFranchise =
    counts.franchises > 0 ? (invoiceAnalytics.totalIncome / counts.franchises).toFixed(2) : 'N/A';
  const expensePerStudent =
    counts.students > 0 ? (invoiceAnalytics.totalExpense / counts.students).toFixed(2) : 'N/A';
  const invoicesPerLocation =
    counts.locations > 0 ? (invoiceAnalytics.totalInvoices / counts.locations).toFixed(2) : 'N/A';
  const sessionsPerStudent =
    counts.students > 0 ? (sessionAnalytics.length / counts.students).toFixed(2) : 'N/A';

  // Define metric items
  const metrics: MetricItem[] = [
    {
      icon: <PersonIcon fontSize="large" />,
      label: t('studentTeacherRatio'),
      value: studentTeacherRatio,
      color: 'info',
    },
    {
      icon: <MonetizationOnIcon fontSize="large" />,
      label: t('incomePerFranchise'),
      value: incomePerFranchise !== 'N/A' ? `${incomePerFranchise}€` : 'N/A',
      color: 'success',
    },
    {
      icon: <ReceiptIcon fontSize="large" />,
      label: t('expensePerStudent'),
      value: expensePerStudent !== 'N/A' ? `${expensePerStudent}€` : 'N/A',
      color: 'warning',
    },
    {
      icon: <BusinessIcon fontSize="large" />,
      label: t('invoicesPerLocation'),
      value: invoicesPerLocation !== 'N/A' ? invoicesPerLocation : 'N/A',
      color: 'info',
    },
    {
      icon: <EventIcon fontSize="large" />,
      label: t('sessionsPerStudent'),
      value: sessionsPerStudent !== 'N/A' ? sessionsPerStudent : 'N/A',
      color: 'success',
    },
  ];

  // Handle Loading and Error States
  if (loadingCounts || loadingAnalytics || loadingInvoices) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {t('loadingMetrics')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" color="error" align="center">
        {t('errorLoadingMetrics')}
      </Typography>
    );
  }

  return (
    <Card>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          {t('dashboardMetrics')}
        </Typography>
        <Divider />
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                display="flex"
                alignItems="center"
                p={2}
                bgcolor="background.paper"
                borderRadius={2}
                boxShadow={1}
              >
                <Box mr={2} color={metric.color === 'error' ? 'error.main' : 'info.main'}>
                  {metric.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="h6">{metric.value}</Typography>
                  {metric.label === t('incomePerFranchise') && incomePerFranchise !== 'N/A' && (
                    <Label color="success">{invoiceAnalytics.netIncomePercentage}%</Label>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <Divider />
 
    </Card>
  );
}

export default DashboardMetrics;
