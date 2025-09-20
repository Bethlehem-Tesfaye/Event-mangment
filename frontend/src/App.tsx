import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}



