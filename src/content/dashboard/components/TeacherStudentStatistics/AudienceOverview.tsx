import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import {
  Button,
  Card,
  Box,
  CardContent,
  CardHeader,
  Menu,
  MenuItem,
  Divider,
  styled,
  useTheme,
  CircularProgress
} from '@mui/material';
import Chart from 'react-apexcharts';
import { fetchData, periods, userTypes } from './data';
import { useDashboard } from 'src/contexts/DashboardContext';

function AudienceOverview() {
  const { t } = useTranslation();
  const actionRef1 = useRef(null);
  const actionRef2 = useRef(null);
  const [openPeriod, setOpenMenuPeriod] = useState(false);
  const [openAudience, setOpenMenuAudience] = useState(false);
  const [period, setPeriod] = useState(periods[2].text); // Default to Year
  const [userType, setUserType] = useState(userTypes[1].text); // Default to Students
  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { selectedFranchise } = useDashboard();

  const ChartAudienceOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: [theme.colors.primary.main],
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1
    },
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      strokeDashArray: 5,
      borderColor: theme.colors.alpha.black[10]
    },
    legend: {
      show: false
    },
    markers: {
      hover: {
        sizeOffset: 2
      },
      shape: 'circle' as const,
      size: 6,
      strokeWidth: 3,
      strokeOpacity: 1,
      strokeColors: [theme.colors.primary.main],
      colors: [theme.colors.alpha.white[100]]
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    theme: {
      mode: theme.palette.mode
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
      tickAmount: 3,
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

  useEffect(() => {
    fetchData(
      selectedFranchise,
      period,
      userType,
      setData,
      setLabels,
      setLoading
    );
  }, [period, userType]);

  const differences = data.map((value, index) => {
    if (index === 0) return 0;
    return value - data[index - 1];
  });

  const annotations = differences.map((difference, index) => ({
    x: labels[index],
    y: data[index],
    label: {
      text: `${difference >= 0 ? '+' : ''}${difference}`,
      style: {
        color: difference >= 0 ? 'green' : 'red'
      }
    }
  }));

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
        title={t('User Overview')}
      />
      <Divider />
      <CardContent>
        <Button
          size="small"
          variant="outlined"
          ref={actionRef2}
          onClick={() => setOpenMenuAudience(true)}
          endIcon={<ExpandMoreTwoToneIcon fontSize="small" />}
        >
          {userType}
        </Button>
        <Menu
          disableScrollLock
          anchorEl={actionRef2.current}
          onClose={() => setOpenMenuAudience(false)}
          open={openAudience}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          {userTypes.map((_audience) => (
            <MenuItem
              key={_audience.value}
              onClick={() => {
                setUserType(_audience.text);
                setOpenMenuAudience(false);
              }}
            >
              {_audience.text}
            </MenuItem>
          ))}
        </Menu>
        <Box mt={2}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Chart
              options={{
                ...ChartAudienceOptions,
                xaxis: { ...ChartAudienceOptions.xaxis, categories: labels },
                annotations: {
                  points: annotations
                }
              }}
              series={[
                {
                  name: `Total ${userType}`,
                  data: data
                }
              ]}
              type="line"
              height={230}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default AudienceOverview;
