import { getAllMessages } from 'src/services/chatService';
import { format } from 'date-fns';

interface Sender {
  id: number;  // Changed from string to number
  firstName: string;
  lastName: string;
}

export interface Message {
  id: number;  // Changed from string to number
  content: string;
  sentAt: string;
  sender: Sender;
  chatRoom?: {
    id: number;
  };
}

interface MessagesResponse {
  messages: Message[];
  page: number;
  totalPages: number;
  totalMessages: number;
}

interface FetchMessagesParams {
  chatRoomId: number;
  page: number;
  limit: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalMessages: React.Dispatch<React.SetStateAction<number>>;
  append?: boolean;
}

export const fetchMessages = async ({
  chatRoomId,
  page,
  limit,
  setMessages,
  setLoading,
  setHasMore,
  setTotalMessages,
  append = false
}: FetchMessagesParams): Promise<void> => {
  setLoading(true);
  try {
    const response: MessagesResponse = await getAllMessages(chatRoomId, page, limit);
    const { messages, totalMessages, totalPages } = response;
    
    setTotalMessages(totalMessages);
    
    if (!messages || messages.length === 0) {
      if (!append) {
        setMessages([]);
      }
      setHasMore(false);
    } else {
      // Sort messages by sentAt in ascending order (oldest first)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );

      setMessages(prevMessages =>
        append 
          ? [...sortedMessages, ...prevMessages] // Put older messages at the top
          : sortedMessages
      );
      
      setHasMore(page < totalPages);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    if (!append) {
      setMessages([]);
    }
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};

export const formatDateDivider = (date: string): string => {
  const today = new Date();
  const dateObj = new Date(date);
  
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  return format(dateObj, 'MMMM dd yyyy');
};

export const calculateMessagesPerPage = (
  containerHeight: number,
  messageHeight: number
): number => {
  const calculated = Math.floor(containerHeight / messageHeight);
  return Math.max(calculated, 10); // Set minimum to 10 messages per page
};