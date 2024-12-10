import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect
} from 'react';
import { useAuth } from 'src/hooks/useAuth';
import { t } from "i18next"

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
}

interface ChatContextData {
  chatRoomId: number | null;
  participants: Participant[];
  setChatRoomId: (id: number | null) => void;
  setParticipants: (participants: Participant[]) => void;
  firstName: string;
  lastName: string;
}

const ChatContext = createContext<ChatContextData>({
  chatRoomId: null,
  participants: [],
  setChatRoomId: () => { },
  setParticipants: () => { },
  firstName: '',
  lastName: ''
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { username } = useAuth();
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [firstName, lastName] = username ? username.split(' ') : ['User', ''];

  return (
    <ChatContext.Provider
      value={{
        chatRoomId,
        participants,
        setChatRoomId,
        setParticipants,
        firstName,
        lastName
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the ChatContext
export const useChat = () => {
  return useContext(ChatContext);
};
