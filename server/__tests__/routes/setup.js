import express from "express";
import cookieParser from "cookie-parser";
import { vi } from "vitest";

/**
 * Creates a test Express app with the given router mounted at the given path.
 * Mocks the `io` socket instance and provides cookie parsing + JSON body parsing.
 */
export function createTestApp(path, router) {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());

  const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() };
  app.set("io", mockIo);

  app.use(path, router);

  // Error handler
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  });

  return app;
}
