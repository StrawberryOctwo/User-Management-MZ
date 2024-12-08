// src/components/InvoiceAnalytics/charts/IncomeChart.tsx

import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

type IncomeChartProps = {
  data: number[];
  categories: string[];
  themeMode: 'light' | 'dark';
  primaryColor: string;
};

const IncomeChart: React.FC<IncomeChartProps> = ({
  data,
  categories,
  themeMode,
  primaryColor
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    colors: [primaryColor],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: themeMode === 'light' ? '#000' : '#fff'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: themeMode === 'light' ? '#000' : '#fff'
        }
      },
      title: {
        text: '€'
      }
    },
    tooltip: {
      theme: themeMode,
      y: {
        formatter: (val: number) => `€${val.toLocaleString('de')}`
      }
    },
    grid: {
      borderColor: themeMode === 'light' ? '#e0e0e0' : '#444',
      strokeDashArray: 5
    }
  };

  const series = [
    {
      name: 'Income',
      data
    }
  ];

  return <Chart options={options} series={series} type="bar" height={350} />;
};

export default IncomeChart;
