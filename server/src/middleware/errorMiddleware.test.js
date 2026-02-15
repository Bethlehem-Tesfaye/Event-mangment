import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../utils/logger.js", () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}));

const { default: errorMiddleware } = await import("./errorMiddleware.js");

describe("errorMiddleware", () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  it("responds with error statusCode", async () => {
    const err = { statusCode: 404, message: "Not found", stack: "stack" };
    const req = { method: "GET", originalUrl: "/test", ip: "127.0.0.1", body: {} };
    await errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Not found" })
    );
  });

  it("falls back to err.status", async () => {
    const err = { status: 422, message: "Unprocessable" };
    const req = { method: "POST", originalUrl: "/data", ip: "::1", body: {} };
    await errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it("defaults to 500 when no status is set", async () => {
    const err = { message: "Something broke" };
    const req = { method: "GET", originalUrl: "/", ip: "::1", body: {} };
    await errorMiddleware(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("defaults message to 'Internal Server Error'", async () => {
    const err = {};
    const req = { method: "GET", originalUrl: "/", ip: "::1", body: {} };
    await errorMiddleware(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal Server Error" })
    );
  });

  it("includes stack in non-production", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const err = { message: "oops", stack: "Error: oops\n    at ..." };
    const req = { method: "GET", originalUrl: "/", ip: "::1", body: {} };
    await errorMiddleware(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ stack: err.stack })
    );
    process.env.NODE_ENV = origEnv;
  });

  it("excludes stack in production", async () => {
    const origEnv = process.env.NODE_ENV;
    const origLog = process.env.LOG_LEVEL;
    process.env.NODE_ENV = "production";
    delete process.env.LOG_LEVEL;
    const err = { message: "oops", stack: "secret stack" };
    const req = { method: "GET", originalUrl: "/", ip: "::1", body: {} };
    await errorMiddleware(err, req, res, next);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.stack).toBeUndefined();
    process.env.NODE_ENV = origEnv;
    if (origLog !== undefined) process.env.LOG_LEVEL = origLog;
  });

  it("redacts password fields in body", async () => {
    const { default: logger } = await import("../utils/logger.js");
    const err = { message: "err", statusCode: 400 };
    const req = {
      method: "POST",
      originalUrl: "/register",
      ip: "::1",
      body: { password: "secret123", currentPassword: "old", newPassword: "new" }
    };
    await errorMiddleware(err, req, res, next);
    const bodyCalls = logger.error.mock.calls.filter(
      (c) => typeof c[0] === "string" && c[0].startsWith("Body:")
    );
    for (const call of bodyCalls) {
      expect(call[0]).not.toContain("secret123");
      expect(call[0]).toContain("[REDACTED]");
    }
  });
});
