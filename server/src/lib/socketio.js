import { Server } from "socket.io";

let io = null;

export function initializeSocketIO(server) {
  if (io) {
    return io;
  }
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  return io;
}

export function getConnection() {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }
  return io;
}
