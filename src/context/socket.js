import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import vars from "../config";
import { useLoginState } from "./loginContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { loginState } = useLoginState();

  useEffect(() => {
    let newSocket;
    if (loginState.loggedin) {
      newSocket = io(vars.serverUrl, {
        transports: ["websocket"],
        withCredentials: true,
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });
    }
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, [loginState.loggedin]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
