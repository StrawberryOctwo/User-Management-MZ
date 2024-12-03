
// src/components/InvoiceAnalytics/charts/SummaryChart.tsx

import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

type SummaryChartProps = {
  incomeData: number[];
  expenseData: number[];
  categories: string[];
  themeMode: 'light' | 'dark';
  primaryColor: string;
  errorColor: string;
};

const SummaryChart: React.FC<SummaryChartProps> = ({
  incomeData,
  expenseData,
  categories,
  themeMode,
  primaryColor,
  errorColor,
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      background: 'transparent',
      toolbar: {
        show: false,
      },
    },
    colors: [primaryColor, errorColor],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: themeMode === 'light' ? '#000' : '#fff',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: themeMode === 'light' ? '#000' : '#fff',
        },
      },
      title: {
        text: '€',
      },
    },
    tooltip: {
      theme: themeMode,
      y: {
        formatter: (val: number) => `€${val.toLocaleString()}`,
      },
    },
    grid: {
      borderColor: themeMode === 'light' ? '#e0e0e0' : '#444',
      strokeDashArray: 5,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
  };

  const series = [
    {
      name: 'Income',
      data: incomeData,
    },
    {
      name: 'Expense',
      data: expenseData,
    },
  ];

  return <Chart options={options} series={series} type="line" height={350} />;
};

export default SummaryChart;
