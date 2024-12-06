import { fetchUserAnalytics } from 'src/services/dashboardService';

export const fetchData = async (
  selectedFranchise: string,
  period: string,
  userType: string,
  setData: any,
  setLabels: any,
  setLoading: any
) => {
  setLoading(true);
  try {
    const response = await fetchUserAnalytics(
      selectedFranchise,
      userType,
      period
    );
    const { data: apiData, labels: apiLabels } = response;
    setData(apiData);
    setLabels(apiLabels);
  } catch (error) {
    console.error('Error fetching data:', error);
    setData([]);
    setLabels([]);
  } finally {
    setLoading(false);
  }
};

export const periods = [
  {
    value: 'Week',
    text: 'Week'
  },
  {
    value: 'Month',
    text: 'Month'
  },
  {
    value: 'Year',
    text: 'Year'
  }
];

export const userTypes = [
  {
    value: 'Teachers',
    text: 'Teachers'
  },
  {
    value: 'Students',
    text: 'Students'
  }
];

export type UserData = {
  day: {
    total: number[];
  };
  month: {
    total: number[];
  };
  year: {
    total: number[];
  };
};

export const userData: UserData = {
  day: { total: [100, 120, 130, 140, 150, 160, 170] }, // Example data for each day of the week
  month: {
    total: [
      2000, 2100, 2200, 2300, 2400, 2500, 1000, 2700, 2800, 2900, 3000, 3100
    ]
  }, // Example data for each month of the year
  year: { total: [24000, 25000, 26000, 27000, 28000] } // Example data for each year
};

export const getDataForPeriod = (period: string) => {
  switch (period) {
    case 'Day':
      return {
        data: userData.day.total,
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
    case 'Month':
      return {
        data: userData.month.total,
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ]
      };
    case 'Year':
      return {
        data: userData.year.total,
        labels: ['2018', '2019', '2020', '2021', '2022']
      };
    default:
      return {
        data: userData.month.total,
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ]
      };
  }
};
