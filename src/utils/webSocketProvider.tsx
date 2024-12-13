import React, { createContext, useEffect, useContext, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

// Define WebSocket context type
type WebSocketContextType = Socket | null;

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType>(null);

// Props for the WebSocketProvider
interface WebSocketProviderProps {
  children: ReactNode;
}

// Initialize the shared WebSocket instance
const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL, {

  transports: ["polling"],
});
  

// WebSocketProvider Component
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  useEffect(() => {
    // Handle connection events
    socket.on("connect", () => {
      
    });

    socket.on("disconnect", () => {
      
    });
    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });
    
    socket.on("error", (err) => {
      console.error("WebSocket Error:", err);
    });
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocket = (): Socket => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
