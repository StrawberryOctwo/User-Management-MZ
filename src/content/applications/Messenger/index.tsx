import { useState } from 'react';
import TopBarContent from './components/TopBarContent/TopBarContent';
import SidebarContent from './components/SidebarContent/SidebarContent';
import ChatContent from './components/ChatContent/ChatContent';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import Scrollbar from 'src/components/Scrollbar';
import { Box, Divider, useTheme } from '@mui/material';
import BottomBarContent from './components/BottomBarContent/BottomBarContent';
import {
  RootWrapper,
  DrawerWrapperMobile,
  Sidebar,
  ChatWindow,
  ChatTopBar,
  IconButtonToggle
} from './index-styles';
import { ChatProvider } from './context/ChatContext';

function ApplicationsMessenger() {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ChatProvider>
      <RootWrapper className="Mui-FixedWrapper">
        <DrawerWrapperMobile
          sx={{
            display: { lg: 'none', xs: 'inline-block' }
          }}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
        >
          <Scrollbar>
            <SidebarContent />
          </Scrollbar>
        </DrawerWrapperMobile>
        <Sidebar
          sx={{
            display: { xs: 'none', lg: 'inline-block' }
          }}
        >
          <Scrollbar>
            <SidebarContent />
          </Scrollbar>
        </Sidebar>
        <ChatWindow>
          <ChatTopBar
            sx={{
              display: { xs: 'flex', lg: 'inline-block' }
            }}
          >
            <IconButtonToggle
              sx={{
                display: { lg: 'none', xs: 'flex' },
                mr: 2
              }}
              color="primary"
              onClick={handleDrawerToggle}
              size="small"
            >
              <MenuTwoToneIcon />
            </IconButtonToggle>
            <TopBarContent />
          </ChatTopBar>
          <Box flex={1}>
            <Scrollbar>
              <ChatContent />
            </Scrollbar>
          </Box>
          <Divider />
          <BottomBarContent />
        </ChatWindow>
      </RootWrapper>
    </ChatProvider>
  );
}

export default ApplicationsMessenger;
