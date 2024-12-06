import { getAllChats } from 'src/services/chatService';

export const fetchChats = async (
  setChats,
  setLoading,
  setHasMore,
  setTotalChats,
  append = false,
  searchTerm = '',
  page = 1,
  limit = 10
) => {
  setLoading(true);
  try {
    const response = await getAllChats(searchTerm, page, limit);
    const data = response.chats;
    setTotalChats(response.totalChats);

    if (!data || data.length === 0) {
      if (!append) {
        setChats([]);
      }
      setHasMore(false);
    } else {
      setChats(prevChats => append ? [...prevChats, ...data] : data);
      setHasMore(response.totalChats > (page * limit));
    }
  } catch (err) {
    console.error('Error fetching chats:', err);
    if (!append) {
      setChats([]);
    }
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};

