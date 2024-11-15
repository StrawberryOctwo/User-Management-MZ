import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useEffect, useState } from 'react';

interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  address: string;
  postalCode: string;
  phoneNumber: string;
}

function GeneralInfoTab() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Placeholder fetch for user info
    const fetchData = async () => {
      const data = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        dob: "1990-05-15",
        email: "john.doe@example.com",
        address: "123 Elm Street",
        postalCode: "90210",
        phoneNumber: "123-456-7890"
      };
      setUserInfo(data);
    };

    fetchData();
  }, []);

  if (!userInfo) return null;

  return (
    <Card>
      <CardHeader
        avatar={<Avatar>{userInfo.firstName[0]}{userInfo.lastName[0]}</Avatar>}
        title={`${userInfo.firstName} ${userInfo.lastName}`}
        subheader="General Information"
      />
      <Divider />
      <CardContent>
        <List>
          <ListItem>
            <ListItemText
              primary="Date of Birth"
              secondary={userInfo.dob}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Email"
              secondary={userInfo.email}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Address"
              secondary={userInfo.address}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Postal Code"
              secondary={userInfo.postalCode}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Phone Number"
              secondary={userInfo.phoneNumber}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}

export default GeneralInfoTab;
