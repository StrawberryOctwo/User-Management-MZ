import { api } from './api';

export const createOrGetChatRoom = async (user2Id: number) => {
  try {
    const response = await api.post(`/chat-room`, {
      user2Id: user2Id
    });
    return response.data;
  } catch (error) {
    console.error('Error creating or fetching chat room:', error);
    throw new Error('Could not fetch chat room.');
  }
};

// Fetch a single invoice by its ID
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

export const getAllMessages = async (chatRoomId: number) => {
  try {
    const response = await api.get(`/chat-room/${chatRoomId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Could not fetch messages.');
  }
};
