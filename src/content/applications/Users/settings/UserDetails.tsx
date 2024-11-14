import { Grid, Typography, Box, CardContent, TextField } from '@mui/material';
import { useState } from 'react';
import Text from 'src/components/Text';

interface UserInfo {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  address: string;
  postalCode: string;
}

interface UserDetailsProps {
  isEditing: boolean;
}

function UserDetails({ isEditing }: UserDetailsProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "John",
    lastName: "Doe",
    dob: "1990-05-15",
    email: "john.doe@example.com",
    address: "123 Elm Street",
    postalCode: "90210"
  });

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo({ ...userInfo, [field]: value });
  };

  return (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="subtitle2">
        <Grid container spacing={0}>
          {Object.keys(userInfo).map((key) => (
            <Grid container key={key} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
                <Box pr={3}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </Box>
              </Grid>
              <Grid item xs={12} sm={8} md={9}>
                {isEditing ? (
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={userInfo[key as keyof UserInfo]}
                    onChange={(e) =>
                      handleInputChange(key as keyof UserInfo, e.target.value)
                    }
                  />
                ) : (
                  <Text color="black">{userInfo[key as keyof UserInfo]}</Text>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Typography>
    </CardContent>
  );
}

export default UserDetails;
