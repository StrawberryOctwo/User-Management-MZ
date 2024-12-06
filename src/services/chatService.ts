import { api } from './api';

export const createOrGetChatRoom = async (user2Id: number) => {
  try {
    const response = await api.post(`/chat-room`, {
      user2Id: user2Id
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      'Could not fetch chat room.';
    throw new Error(errorMessage);
  }
};


export const sendMessage = async (chatRoomId: number, content: string) => {
  try {
    const response = await api.post(`/chat-room/send-message`, {
      chatRoomId: chatRoomId,
      content: content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Could not fetch send message.');
  }
};
export const resetUnreadCount = async (chatRoomId: number) => {
  try {
    const response = await api.post(`/chat-room/reset-unread`, {
      chatRoomId: chatRoomId
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting unread count:', error);
    throw new Error('Could not reset unread count.');
  }
};
export const joinChatRoom = async (chatRoomId: number, userId: number) => {
  try {
    const response = await api.post(`/chat-room/join`, {
      chatRoomId: chatRoomId,
      userId: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error joining chat room:', error);
    throw new Error('Could not join chat room.');
  }
};

export const getAllMessages = async (
  chatRoomId: number,
  page: number,
  limit: number
) => {
  try {
    const response = await api.get(`/chat-room/${chatRoomId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Could not fetch messages.');
  }
};

export const getAllChats = async (
  searchTerm: string,
  page: number,
  limit: number
) => {
  try {
    const response = await api.get(
      `/chat-rooms?page=${page}&limit=${limit}&search=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw new Error('Could not fetch chats.');
  }
};
