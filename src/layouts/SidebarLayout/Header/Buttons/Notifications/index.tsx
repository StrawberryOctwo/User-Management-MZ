import { useEffect, useRef, useState } from 'react';
import {
  alpha,
  Badge,
  Box,
  Button,
  Fade,
  IconButton,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography
} from '@mui/material';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import { styled } from '@mui/material/styles';
import { formatDistanceToNowStrict, set } from 'date-fns';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { useAuth } from 'src/hooks/useAuth';
import { handleMarkAsRead } from 'src/services/notificationService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { fetchNotifications, INotification } from './utils';

const NotificationsBadge = styled(Badge)(
  ({ theme }) => `
  .MuiBadge-badge {
      background-color: ${alpha(theme.palette.error.main, 0.1)};
      color: ${theme.palette.error.main};
      min-width: 16px; 
      height: 16px;
      padding: 0;
      &::after {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 0 1px ${alpha(theme.palette.error.main, 0.3)};
          content: "";
      }
  }
`
);

function HeaderNotifications() {
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { userId } = useAuth();
  const limit = 3;

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  useEffect(() => {
    fetchNotifications(
      currentPage,
      setNotifications,
      setUnreadCount,
      setTotalPages,
      limit
    );
  }, [currentPage]);

  // SSE for live notifications
  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(
      `http://localhost:3003/api/notifications/connect?userId=${userId}`
    );

    eventSource.onopen = () => {
      console.log('SSE connection established successfully.');
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: INotification = JSON.parse(event.data);
        console.log('New notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error.');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      <Tooltip arrow title="Notifications">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <NotificationsBadge
            badgeContent={unreadCount}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <NotificationsActiveTwoToneIcon />
          </NotificationsBadge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            {unreadCount > 0
              ? `${unreadCount} Unread Notifications`
              : 'No Notifications'}
          </Typography>
        </Box>
        <List
          sx={{
            p: 0,
            maxHeight: 600,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px' // Set scrollbar width
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)', // Thumb color
              borderRadius: '3px' // Rounded corners for thumb
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)' // Thumb color on hover
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)' // Track color
            }
          }}
        >
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                p: 2,
                minWidth: 350,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box flex="1" width="100%">
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  {notification.title}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 2 }}
                >
                  {notification.message}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary'
                  }}
                >
                  {formatDistanceToNowStrict(new Date(notification.createdAt), {
                    addSuffix: true
                  })}
                </Typography>
                {!notification.isRead ? (
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() =>
                      handleMarkAsRead(
                        notification.id,
                        setNotifications,
                        setUnreadCount
                      )
                    }
                    startIcon={<RemoveRedEyeOutlinedIcon />}
                  >
                    Mark as Read
                  </Button>
                ) : (
                  <Fade in={notification.isRead}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'success.main'
                      }}
                    >
                      <CheckCircleOutlineIcon sx={{ mr: 0.5 }} />
                      Read
                    </Typography>
                  </Fade>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
        {notifications.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2
            }}
          >
            <Button
              variant="contained"
              size="small"
              disabled={currentPage === 0}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <Typography variant="body2">
              Page {currentPage + 1} of {totalPages}
            </Typography>
            <Button
              variant="contained"
              size="small"
              disabled={currentPage >= totalPages - 1}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
}

export default HeaderNotifications;
