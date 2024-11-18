import { Grid, Typography, Box, CardContent, TextField } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Text from 'src/components/Text';

interface UserInfo {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

interface UserDetailsProps {
  user: any;
  isEditing: boolean;
  setUser: (user: any) => void;
}

function UserDetails({ user, isEditing, setUser }: UserDetailsProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    setUserInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      dob: moment(user.dob).format('YYYY-MM-DD'),
      email: user.email,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode
    });
  }, [user]);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    const updatedInfo = { ...userInfo, [field]: value };
    setUserInfo(updatedInfo);
    setUser((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="subtitle2">
        <Grid container spacing={0}>
          {Object.keys(userInfo).map((key) => (
            <Grid container key={key} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4} md={3} textAlign={{ sm: 'right' }}>
                <Box pr={3}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Box>
              </Grid>
              <Grid item xs={12} sm={8} md={9}>
                {isEditing ? (
                  key === 'dob' ? (
                    <TextField
                      variant="outlined"
                      fullWidth
                      type="date"
                      value={userInfo.dob}
                      onChange={(e) =>
                        handleInputChange(key as keyof UserInfo, e.target.value)
                      }
                    />
                  ) : (
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={userInfo[key as keyof UserInfo]}
                      onChange={(e) =>
                        handleInputChange(key as keyof UserInfo, e.target.value)
                      }
                    />
                  )
                ) : (
                  <Text color="black">
                    {key === 'dob'
                      ? moment(userInfo.dob).format('MMMM Do, YYYY')
                      : userInfo[key as keyof UserInfo]}
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

export default UserDetails;
