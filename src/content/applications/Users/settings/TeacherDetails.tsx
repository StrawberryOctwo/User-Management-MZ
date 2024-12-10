import {
  Grid,
  Typography,
  Box,
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Text from 'src/components/Text';
import { t } from "i18next"

interface TeacherInfo {
  idNumber: string;
  taxNumber: string;
  bank: string;
  iban: string;
  bic: string;
  contractStartDate: string;
  contractEndDate: string;
  hourlyRate: number;
  employeeNumber: string;
  invoiceDay: number; // Added invoiceDay field
}

interface TeacherDetailsProps {
  isEditing: boolean;
  user: any;
  setUser: (user: any) => void;
}

function TeacherDetails({ user, isEditing, setUser }: TeacherDetailsProps) {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    idNumber: '',
    taxNumber: '',
    bank: '',
    iban: '',
    bic: '',
    contractStartDate: '',
    contractEndDate: '',
    hourlyRate: 0,
    employeeNumber: '',
    invoiceDay: 1 // Default to 1
  });

  useEffect(() => {
    setTeacherInfo({
      idNumber: user.teacherDetails.idNumber,
      taxNumber: user.teacherDetails.taxNumber,
      bank: user.teacherDetails.bank,
      iban: user.teacherDetails.iban,
      bic: user.teacherDetails.bic,
      contractStartDate: user.teacherDetails.contractStartDate,
      contractEndDate: user.teacherDetails.contractEndDate,
      hourlyRate: user.teacherDetails.hourlyRate,
      employeeNumber: user.teacherDetails.employeeNumber,
      invoiceDay: user.teacherDetails.invoiceDay || 1 // Default to 1
    });
  }, [user]);

  const handleInputChange = (field: keyof TeacherInfo, value: any) => {
    const updatedInfo = { ...teacherInfo, [field]: value };
    setTeacherInfo(updatedInfo);
    setUser((prev: any) => ({
      ...prev,
      teacherDetails: { ...prev.teacherDetails, [field]: value }
    }));
  };

  return (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="subtitle2">
        <Grid container spacing={0}>
          {['idNumber', 'taxNumber', 'bank', 'iban', 'bic'].map((field) => (
            <Grid container key={field} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
                <Box pr={3}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </Box>
              </Grid>
              <Grid item xs={12} sm={8} md={9}>
                {isEditing ? (
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={teacherInfo[field as keyof TeacherInfo]}
                    onChange={(e) =>
                      handleInputChange(
                        field as keyof TeacherInfo,
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Text color="black">
                    {teacherInfo[field as keyof TeacherInfo]}
                  </Text>
                )}
              </Grid>
            </Grid>
          ))}

          {/* Non-Editable Fields */}
          <Grid container alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
              <Box pr={3}>Contract Dates:</Box>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Text color="black">
                {moment(teacherInfo.contractStartDate).format('MMMM Do, YYYY')}{' '}
                - {moment(teacherInfo.contractEndDate).format('MMMM Do, YYYY')}
              </Text>
            </Grid>
          </Grid>
          <Grid container alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
              <Box pr={3}>Hourly Rate:</Box>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Text color="black">€{teacherInfo.hourlyRate}/hr</Text>
            </Grid>
          </Grid>

          {/* Invoice Day Selection */}
          <Grid container alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
              <Box pr={3}>Invoice Day:</Box>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              {isEditing ? (
                <FormControl fullWidth>
                  <InputLabel id="invoice-day-label">Select Invoice Day</InputLabel>
                  <Select
                    labelId="invoice-day-label"
                    value={teacherInfo.invoiceDay}
                    onChange={(e) =>
                      handleInputChange('invoiceDay', e.target.value)
                    }
                  >
                    <MenuItem value={1}>1st</MenuItem>
                    <MenuItem value={15}>15th</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Text color="black">{teacherInfo.invoiceDay === 1 ? '1st' : '15th'}</Text>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Typography>
    </CardContent>
  );
}

export default TeacherDetails;
