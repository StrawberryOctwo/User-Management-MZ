import React from 'react';
import {
  CardHeader,
  Divider,
  Card,
  Typography,
  CardContent,
  Box
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

function TurnOverPieChart() {
  const { t } = useTranslation();

  const turnoverData = {
    labels: ['Student Fees', 'Teacher Costs'],
    datasets: [
      {
        data: [50000, 20000],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3'],
        hoverBackgroundColor: ['#66bb6a', '#ef5350', '#ffb74d', '#42a5f5']
      }
    ]
  };

  return (
    <Card>
      <CardHeader title={t('Monthly Turnover')} />
      <Divider />
      <CardContent>
        <Typography variant="h6" align="center">
          Turnover
        </Typography>

        <Pie data={turnoverData} />
      </CardContent>
      <Box display="flex" justifyContent="space-between" p={2}>
        <Typography variant="h6" align="center">
          General Profit: $30,000
        </Typography>
        <Typography variant="h6" align="center">
          General Loss: $10,000
        </Typography>
      </Box>
    </Card>
  );
}

export default TurnOverPieChart;
