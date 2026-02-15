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

const { default: authMiddleware } = await import("./authMiddleware.js");

describe("authMiddleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: { cookie: "session=abc" } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  it("attaches user and userId on valid session", async () => {
    const user = { id: "u1", email: "test@test.com" };
    mockGetSession.mockResolvedValue({ user });
    await authMiddleware(req, res, next);
    expect(req.user).toEqual(user);
    expect(req.userId).toBe("u1");
    expect(next).toHaveBeenCalledWith();
  });

  it("returns 401 when session is null", async () => {
    mockGetSession.mockResolvedValue(null);
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized user" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when session has no user", async () => {
    mockGetSession.mockResolvedValue({ user: null });
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 500 on unexpected error", async () => {
    mockGetSession.mockRejectedValue(new Error("DB down"));
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
