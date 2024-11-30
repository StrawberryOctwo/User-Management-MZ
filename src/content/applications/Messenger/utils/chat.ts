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
  chatRoomId: number,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onMessagesLoaded?: () => void // Add an optional callback parameter
) => {
  setLoading(true);
  try {
    const response = await getAllMessages(chatRoomId);
    if (response.messages.length === 0) {
      setMessages([]);
      return;
    }
    setMessages(response.messages);

    // Invoke the callback after messages are loaded
    if (onMessagesLoaded) {
      onMessagesLoaded();
    }
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
