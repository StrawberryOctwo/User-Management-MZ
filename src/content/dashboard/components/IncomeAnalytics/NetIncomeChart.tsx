// src/components/InvoiceAnalytics/charts/NetIncomeChart.tsx

import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

type NetIncomeChartProps = {
  netIncomeData: number[];
  categories: string[];
  themeMode: 'light' | 'dark';
  successColor: string;
  errorColor: string;
};

const NetIncomeChart: React.FC<NetIncomeChartProps> = ({
  netIncomeData,
  categories,
  themeMode,
  successColor,
  errorColor,
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
      toolbar: {
        show: false,
      },
    },
    colors: [netIncomeData.every(val => val >= 0) ? successColor : errorColor],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
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
        formatter: (val: number) => `${val.toLocaleString('de')}€`,
      },
    },
    grid: {
      borderColor: themeMode === 'light' ? '#e0e0e0' : '#444',
      strokeDashArray: 5,
    },
  };

  const series = [
    {
      name: 'Net Income',
      data: netIncomeData,
    },
  ];

  return <Chart options={options} series={series} type="area" height={350} />;
};

export default NetIncomeChart;
