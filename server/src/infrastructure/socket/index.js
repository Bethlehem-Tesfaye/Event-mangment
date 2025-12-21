let io;

export const initSocket = (socketServer) => {
  io = socketServer;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
