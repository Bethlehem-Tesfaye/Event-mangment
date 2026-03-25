import { vi } from "vitest";

export function createMockReq(overrides = {}) {
  const mockIo = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn()
  };
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    userId: null,
    user: null,
    file: null,
    method: "GET",
    originalUrl: "/",
    ip: "127.0.0.1",
    app: { get: vi.fn((key) => (key === "io" ? mockIo : undefined)) },
    ...overrides
  };
}
