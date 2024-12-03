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
  CardActions,
  Grid,
  Typography,
  Divider,
  styled,
  useTheme
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  getDataForPeriod,
  periods,
  allTimeNumbers,
  userData,
  userTypes
} from './data';

const CardActionsWrapper = styled(CardActions)(
  ({ theme }) => `
      background-color: ${theme.colors.alpha.black[5]};
      padding: 0;
      display: block;
`
);

function AudienceOverview() {
  const { t } = useTranslation();
  const actionRef1 = useRef(null);
  const actionRef2 = useRef(null);
  const [openPeriod, setOpenMenuPeriod] = useState(false);
  const [openAudience, setOpenMenuAudience] = useState(false);
  const [period, setPeriod] = useState(periods[2].text);
  const [userType, setUserType] = useState(userTypes[1].text);
  const theme = useTheme();

  const ChartSparklineOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: true
      },
      zoom: {
        enabled: false
      }
    },
    colors: [theme.colors.primary.main],
    dataLabels: {
      enabled: false
    },
    theme: {
      mode: theme.palette.mode
    },
    fill: {
      opacity: 1,
      colors: [theme.colors.primary.main],
      type: 'solid'
    },
    grid: {
      padding: {
        top: 2
      }
    },
    stroke: {
      show: true,
      colors: [theme.colors.primary.main],
      width: 2
    },
    legend: {
      show: false
    },
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
    ],
    tooltip: {
      enabled: false
    },
    xaxis: {
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false
    }
  };

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
      shape: 'circle' as const, // Corrected typing here
      size: 6,
      strokeWidth: 3,
      strokeOpacity: 1,
      strokeColors: [theme.colors.primary.main],
      colors: [theme.colors.alpha.white[100]]
    },
    stroke: {
      curve: 'smooth' as const, // Corrected typing here
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

  const { data, labels } = getDataForPeriod(period);

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
        </Box>
      </CardContent>
      <Divider />
      <CardActionsWrapper>
        <Box>
          <Grid container alignItems="center">
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem absolute />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Students')}
                  </Typography>
                  <Typography variant="h3">
                    {allTimeNumbers.Students}
                  </Typography>
                </Box>

                <Chart
                  options={ChartSparklineOptions}
                  series={[
                    {
                      name: 'Users',
                      data: [
                        467, 696, 495, 477, 422, 585, 691, 294, 508, 304, 499,
                        390
                      ]
                    }
                  ]}
                  type="line"
                  height={55}
                />
              </Box>
              <Divider />
            </Grid>
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem absolute />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Teachers')}
                  </Typography>
                  <Typography variant="h3">
                    {allTimeNumbers.Teachers}
                  </Typography>
                </Box>
                <Chart
                  options={ChartSparklineOptions}
                  series={[
                    {
                      name: 'New Users',
                      data: [
                        581, 203, 462, 518, 329, 395, 375, 447, 303, 423, 405,
                        589
                      ]
                    }
                  ]}
                  type="line"
                  height={55}
                />
              </Box>
              <Divider />
            </Grid>
            <Grid
              xs={12}
              sm={6}
              md={4}
              item
              sx={{
                position: 'relative'
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                <Divider orientation="vertical" flexItem absolute />
              </Box>
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Parents')}
                  </Typography>
                  <Typography variant="h3">{allTimeNumbers.Parents}</Typography>
                </Box>

                <Chart
                  options={ChartSparklineOptions}
                  series={[
                    {
                      name: 'Page Views',
                      data: [
                        353, 380, 325, 246, 682, 605, 672, 271, 386, 630, 577,
                        511
                      ]
                    }
                  ]}
                  type="line"
                  height={55}
                />
              </Box>
              <Divider />
            </Grid>
          </Grid>
        </Box>
      </CardActionsWrapper>
    </Card>
  );
}

export default AudienceOverview;
