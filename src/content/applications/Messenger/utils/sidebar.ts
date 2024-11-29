import { getAllChats } from 'src/services/chatService';

export const fetchChats = async (
  setChats: (chats: any[]) => void,
  setLoading: (loading: boolean) => void,
  searchTerm: string = '',
  page = 1,
  limit = 10
) => {
  setLoading(true);
  try {
    const response = await getAllChats(searchTerm, page, limit);
    const data = response.chats;
    if (!data || data.length === 0) {
      setChats([]);
    } else {
      setChats(data);
    }
  } catch (err) {
    console.error('Error fetching chats:', err);
    setChats([]);
  } finally {
    console.log('Chats fetched');
    setLoading(false);
  }
};
