import { getAllMessages } from 'src/services/chatService';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sentAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const fetchMessages = async (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const response = await getAllMessages(1);
    setMessages(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    setMessages([]);
  } finally {
    setLoading(false);
  }
};

export const formatDateDivider = (date: string) => {
  const today = new Date();
  const dateObj = new Date(date);
  if (dateObj.toDateString() === today.toDateString()) return 'Today';
  return format(dateObj, 'MMMM dd yyyy');
};
