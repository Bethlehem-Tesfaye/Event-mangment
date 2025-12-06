import { useEffect } from "react";
import { socket } from "../lib/socket";

export function useSocket() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnectError = (err: any) => {
      console.error("Socket connect_error:", err);
    };
    socket.on("connect_error", onConnectError);

    return () => {
      socket.disconnect();
      socket.off("connect_error", onConnectError);
    };
  }, []);

  return socket;
}
