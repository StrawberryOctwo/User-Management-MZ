import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    Divider,
    List,
    ListItem,
    Box,
    Typography,
    Avatar,
    Grow,
    TablePagination,
    styled,
    useTheme
} from '@mui/material';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { handleMarkAsRead, getNotifications } from 'src/services/notificationService';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Styled Components
const ImageWrapper = styled(Avatar)(
    ({ theme }) => `
    margin-right: ${theme.spacing(2)};
    background-color: ${theme.palette.primary.main};
    width: 40px;
    height: 40px;
  `
);

const ListItemWrapper = styled(ListItem)(`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-radius: 8px;
  transition: background-color 0.3s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`);

function NotificationsTab() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0); // Zero-based index for MUI TablePagination
    const [totalCount, setTotalCount] = useState(0);
    const limit = 5; // Fixed number of notifications per page
    const theme = useTheme();

    const handleMarkAsReadClick = async (id) => {
        await handleMarkAsRead(id, setNotifications, setUnreadCount);
    };

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // API expects one-based page index
                const data = await getNotifications(currentPage + 1, limit);
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
                setTotalCount(data.total); // Update the total number of notifications
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    return (
        <Card>
            <CardHeader title={t('Notifications')} />
            <Divider />
            <List disablePadding component="nav">
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                        <Typography variant="h6" color="text.secondary">
                            {t("loading")}
                        </Typography>
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                        <Typography variant="h6" color="text.secondary">
                            {t("no_notifications_available")}
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification, index) => (
                        <Grow in key={notification.id} timeout={(index + 1) * 300}>
                            <Box>
                                <ListItemWrapper>
                                    <Box display="flex" alignItems="center" width="100%">
                                        {/* Notification Icon */}
                                        <Box mr={2}>
                                            <ImageWrapper
                                                sx={{
                                                    backgroundColor: notification.isRead
                                                        ? theme.palette.grey[400]
                                                        : theme.palette.success.main
                                                }}
                                            >
                                                <NotificationsActiveTwoToneIcon />
                                            </ImageWrapper>
                                        </Box>

                                        {/* Notification Details */}
                                        <Box width="100%">
                                            <Typography
                                                variant="h6"
                                                color="text.primary"
                                                noWrap
                                                sx={{ minWidth: 100 }}
                                            >
                                                {notification.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 2, // Limit to 2 lines
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t("received")} :{' '}
                                                {formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            width: '100%',
                                            mt: 2
                                        }}
                                    >
                                        {!notification.isRead ? (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: theme.palette.warning.main,
                                                    cursor: 'pointer',
                                                    display: 'flex',        // Add flex display
                                                    alignItems: 'center'    // Center align items vertically
                                                }}
                                                onClick={() => handleMarkAsReadClick(notification.id)}
                                            >
                                                <RemoveRedEyeOutlinedIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                {t("mark_as_read")}
                                            </Typography>
                                        ) : (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: theme.palette.success.main
                                                }}
                                            >
                                                <CheckCircleOutlineIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                {t("read")}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItemWrapper>
                                {index < notifications.length - 1 && <Divider />}
                            </Box>
                        </Grow>
                    ))
                )}
            </List>

            <Divider />

            {totalCount > 0 && (
                <TablePagination
                    component="div"
                    count={totalCount} // Total number of notifications
                    page={currentPage}
                    onPageChange={handlePageChange}
                    rowsPerPage={limit}
                    rowsPerPageOptions={[]} // Removes "Rows per page" option
                    labelRowsPerPage="" // Hides the "Rows per page" label
                />
            )}
        </Card>
    );
}

export default NotificationsTab;
