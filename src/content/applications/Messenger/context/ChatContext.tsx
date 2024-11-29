import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface ChatContextData {
  chatRoomId: string | null;
  participantsIds: string[];
  setChatRoomId: (id: string | null) => void;
  setParticipantsIds: (ids: string[]) => void;
}

// Create the context with default values
const ChatContext = createContext<ChatContextData>({
  chatRoomId: null,
  participantsIds: [],
  setChatRoomId: () => {},
  setParticipantsIds: () => {}
});

// Create a provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [participantsIds, setParticipantsIds] = useState<string[]>([]);

  return (
    <ChatContext.Provider
      value={{ chatRoomId, participantsIds, setChatRoomId, setParticipantsIds }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the ChatContext
export const useChat = () => {
  return useContext(ChatContext);
};
