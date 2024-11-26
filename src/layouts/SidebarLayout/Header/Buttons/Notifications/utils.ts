import { getNotifications } from 'src/services/notificationService';

export interface INotification {
  id: number;
  createdAt: Date;
  title: string;
  message: string;
  isRead: boolean;
  eventType?: string;
}

export const fetchNotifications = async (
  page: number,
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>,
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  limit = 3
) => {
  try {
    const response = await getNotifications(page + 1, limit); // Pages are 1-indexed in the backend
    setNotifications(response.notifications);
    setUnreadCount(response.unreadCount);
    setTotalPages(Math.ceil(response.total / limit)); // Calculate total pages
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};
