"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      const newSocket = socketService.connect(profile.username);
      setSocket(newSocket);

      const onConnect = () => {
        console.log("[Socket] Connected successfully");
        setIsConnected(true);
      };
      const onDisconnect = (reason: string) => {
        console.warn("[Socket] Disconnected:", reason);
        setIsConnected(false);
      };
      const onConnectError = (error: Error) => {
        console.error("[Socket] Connection error:", error.message);
      };

      newSocket.on("connect", onConnect);
      newSocket.on("disconnect", onDisconnect);
      newSocket.on("connect_error", onConnectError);

      if (newSocket.connected) {
        setIsConnected(true);
      }

      return () => {
        newSocket.off("connect", onConnect);
        newSocket.off("disconnect", onDisconnect);
        newSocket.off("connect_error", onConnectError);
        socketService.disconnect();
      };
    } else {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [profile?.username]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
