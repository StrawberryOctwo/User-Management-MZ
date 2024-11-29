export const fetchChats = async (
  setChats: (chats: any[]) => void,
  setLoading: (loading: boolean) => void,
  query = ''
) => {
  setLoading(true);
  try {
    const response = await fetch(`/api/chats?search=${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      setChats([]);
    } else {
      setChats(data);
    }
  } catch (err) {
    console.error('Error fetching chats:', err);
    setChats([]);
  } finally {
    setLoading(false);
  }
};
