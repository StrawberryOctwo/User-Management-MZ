import { Grid, Typography, Box, CardContent, TextField } from '@mui/material';
import { useState } from 'react';
import Text from 'src/components/Text';

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
}

interface TeacherDetailsProps {
  isEditing: boolean;
}

function TeacherDetails({ isEditing }: TeacherDetailsProps) {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    idNumber: "123456789",
    taxNumber: "987654321",
    bank: "Sample Bank",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "COBADEFFXXX",
    contractStartDate: "2020-01-01",
    contractEndDate: "2023-12-31",
    hourlyRate: 50,
    employeeNumber: "T-2023-1001"
  });

  const handleInputChange = (field: keyof TeacherInfo, value: string) => {
    setTeacherInfo({ ...teacherInfo, [field]: value });
  };

  return (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="subtitle2">
        <Grid container spacing={0}>
          {["idNumber", "taxNumber", "bank", "iban", "bic"].map((field) => (
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
                      handleInputChange(field as keyof TeacherInfo, e.target.value)
                    }
                  />
                ) : (
                  <Text color="black">{teacherInfo[field as keyof TeacherInfo]}</Text>
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
                {teacherInfo.contractStartDate} - {teacherInfo.contractEndDate}
              </Text>
            </Grid>
          </Grid>
          <Grid container alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
              <Box pr={3}>Hourly Rate:</Box>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Text color="black">${teacherInfo.hourlyRate}/hr</Text>
            </Grid>
          </Grid>
        </Grid>
      </Typography>
    </CardContent>
  );
}

export default TeacherDetails;
