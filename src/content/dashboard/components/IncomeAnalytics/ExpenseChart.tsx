// src/components/InvoiceAnalytics/charts/ExpenseChart.tsx

import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

type ExpenseChartProps = {
  data: number[];
  categories: string[];
  themeMode: 'light' | 'dark';
  errorColor: string;
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, categories, themeMode, errorColor }) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: {
        show: false,
      },
    },
    colors: [errorColor],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false,
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
        formatter: (val: number) => `€${val.toLocaleString('de')}`,
      },
    },
    grid: {
      borderColor: themeMode === 'light' ? '#e0e0e0' : '#444',
      strokeDashArray: 5,
    },
  };

  const series = [
    {
      name: 'Expense',
      data,
    },
  ];

  return <Chart options={options} series={series} type="bar" height={350} />;
};

export default ExpenseChart;
