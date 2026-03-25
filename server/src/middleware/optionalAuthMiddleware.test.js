import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: vi.fn((headers) => headers)
}));

const mockGetSession = vi.fn();
vi.mock("../modules/auth/auth.js", () => ({
  auth: {
    api: {
      getSession: mockGetSession
    }
  }
}));

vi.mock("../utils/logger.js", () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}));

const { default: optionalAuthMiddleware } = await import(
  "./optionalAuthMiddleware.js"
);

describe("optionalAuthMiddleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = vi.fn();
  });

  it("attaches user when session is valid", async () => {
    const user = { id: "u1", email: "a@b.com" };
    mockGetSession.mockResolvedValue({ user });
    await optionalAuthMiddleware(req, res, next);
    expect(req.user).toEqual(user);
    expect(req.userId).toBe("u1");
    expect(next).toHaveBeenCalled();
  });

  it("sets user to null when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    await optionalAuthMiddleware(req, res, next);
    expect(req.user).toBeNull();
    expect(req.userId).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("sets user to null on error and still calls next", async () => {
    mockGetSession.mockRejectedValue(new Error("fail"));
    await optionalAuthMiddleware(req, res, next);
    expect(req.user).toBeNull();
    expect(req.userId).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("always calls next()", async () => {
    mockGetSession.mockResolvedValue({ user: null });
    await optionalAuthMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
