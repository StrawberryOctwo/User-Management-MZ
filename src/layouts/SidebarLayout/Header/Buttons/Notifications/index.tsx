import { useRef, useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography,
  Fade,
  Modal,
  alpha,
  Badge,
  styled
} from '@mui/material';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { formatDistanceToNowStrict } from 'date-fns';
import { handleMarkAsRead } from 'src/services/notificationService';
import { useAuth } from 'src/hooks/useAuth';
import { INotification, fetchNotifications } from './utils';
import { GridCloseIcon } from '@mui/x-data-grid';

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
  const [selectedNotification, setSelectedNotification] =
    useState<INotification | null>(null);
  const { userId } = useAuth();
  const limit = 3;

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handlePreviousPage = (): void => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = (): void => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handleNotificationClick = (notification: INotification) => {
    setSelectedNotification(notification);
  };

  const handleModalClose = () => {
    setSelectedNotification(null);
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
            {notifications.length > 0
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
                borderColor: 'divider',
                cursor: 'pointer'
              }}
              onClick={() => handleNotificationClick(notification)}
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
                  sx={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 4, // Limit to 4 lines
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mb: 2,
                    width: '450px'
                  }}
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the click event on the ListItem
                      handleMarkAsRead(
                        notification.id,
                        setNotifications,
                        setUnreadCount
                      );
                    }}
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
      <Modal
        open={!!selectedNotification}
        onClose={handleModalClose}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            outline: 'none'
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <GridCloseIcon />
          </IconButton>
          <Typography id="notification-modal-title" variant="h6" component="h2">
            {selectedNotification?.title}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography
            id="notification-modal-description"
            sx={{
              mt: 2,
              lineHeight: 2.5, // Line spacing
              whiteSpace: 'pre-wrap', // Preserve whitespace and wrap text
              wordBreak: 'break-word', // Break long words
              textAlign: 'justify', // Justify text
              maxHeight: '400px', // Limit the height
              overflowY: 'auto', // Enable vertical scrolling
              paddingRight: '16px', // Add padding to the right for scrollbar
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
            {selectedNotification?.message}
          </Typography>

          <Typography
            id="notification-modal-date"
            sx={{
              mt: 2,
              fontSize: '0.875rem', // Smaller font size
              color: 'text.secondary', // Secondary text color
              fontStyle: 'italic', // Italic style
              display: 'block', // Ensure it takes up the full width
              textAlign: 'left' // Align to the right
            }}
          >
            {selectedNotification &&
              new Date(selectedNotification.createdAt).toLocaleString([], {
                hour: '2-digit',
                minute: '2-digit',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              })}
          </Typography>
        </Box>
      </Modal>
    </>
  );
}

export default HeaderNotifications;
