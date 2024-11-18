import { Grid, Typography, Box, CardContent, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import Text from 'src/components/Text';

interface ParentInfo {
  accountHolder: string;
  iban: string;
  bic: string;
}

interface ParentDetailsProps {
  isEditing: boolean;
  user: any;
  setUser: (user: any) => void;
}

function ParentDetails({ user, isEditing, setUser }: ParentDetailsProps) {
  const [parentInfo, setParentInfo] = useState<ParentInfo>({
    accountHolder: '',
    iban: '',
    bic: ''
  });

  useEffect(() => {
    setParentInfo({
      accountHolder: user.parentDetails.accountHolder,
      iban: user.parentDetails.iban,
      bic: user.parentDetails.bic
    });
  }, [user]);

  const handleInputChange = (field: keyof ParentInfo, value: string) => {
    const updatedInfo = { ...parentInfo, [field]: value };
    setParentInfo(updatedInfo);
    setUser((prev: any) => ({
      ...prev,
      parentDetails: { ...prev.parentDetails, [field]: value }
    }));
  };

  return (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="subtitle2">
        <Grid container spacing={0}>
          {['accountHolder', 'iban', 'bic'].map((field) => (
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
                    value={parentInfo[field as keyof ParentInfo]}
                    onChange={(e) =>
                      handleInputChange(
                        field as keyof ParentInfo,
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Text color="black">
                    {parentInfo[field as keyof ParentInfo]}
                  </Text>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Typography>
    </CardContent>
  );
}

export default ParentDetails;
