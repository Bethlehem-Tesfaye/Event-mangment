import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_AUTH_API_URL!, {
  withCredentials: true,
  autoConnect: false,
  // try polling first so the handshake can succeed over XHR (helps with cookies/CORS)
  transports: ["polling", "websocket"],
  path: "/socket.io",
});
