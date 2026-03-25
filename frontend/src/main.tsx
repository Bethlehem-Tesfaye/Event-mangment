import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeProvider.tsx";
import { AnonymousBootstrap } from "./features/auth/hooks/AnonymousBootstrap.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <AnonymousBootstrap>
          <App />
        </AnonymousBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
