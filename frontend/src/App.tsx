import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { Toaster } from "sonner";
import { useSocket } from "./hooks/useSocket.ts";
import { useEffect } from "react";

export default function App() {
  const socket = useSocket();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("WebSocket connected! ID:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("notification", (data) => {
      console.log("Received notification:", data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("notification");
    };
  }, [socket]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </>
  );
}
