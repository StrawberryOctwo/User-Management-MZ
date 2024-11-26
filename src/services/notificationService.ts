import { api } from './api';

export const handleMarkAsRead = async (
  notificationId: number,
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>,
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    // Send the request to mark the notification as read
    await api.put(`/notifications/${notificationId}/read`);
    // Update the notification's isRead property
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    // Update the unread count
    setUnreadCount((prev) => prev - 1);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

export const getNotifications = async (page: number, limit: number) => {
  try {
    const data = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return data.data;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};
