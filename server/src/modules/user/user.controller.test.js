import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockReq } from "../../../__tests__/helpers/createMockReq.js";
import { createMockRes } from "../../../__tests__/helpers/createMockRes.js";

vi.mock("./user.service.js", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  refreshTokens: vi.fn(),
  logoutUser: vi.fn(),
  changePassword: vi.fn(),
  verrtfiyEmail: vi.fn(),
  resendVerification: vi.fn(),
  oauthSignIn: vi.fn(),
  setPassword: vi.fn()
}));

const userService = await import("./user.service.js");
const {
  register,
  login,
  refresh,
  logout,
  me,
  changePassword,
  verifyEmailController,
  resendVerifyController,
  googleCallback,
  setPassword
} = await import("./user.controller.js");

describe("register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with user and accessToken, sets cookie", async () => {
    userService.registerUser.mockResolvedValue({
      user: { id: "u1", email: "a@b.com" },
      accessToken: "at",
      refreshToken: "rt"
    });
    const req = createMockReq({ body: { email: "a@b.com", password: "123456" } });
    const res = createMockRes();
    const next = vi.fn();
    await register(req, res, next);
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "rt", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: { user: { id: "u1", email: "a@b.com" }, accessToken: "at" }
    });
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    userService.registerUser.mockRejectedValue(err);
    const req = createMockReq({ body: {} });
    const res = createMockRes();
    const next = vi.fn();
    await register(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with user and accessToken", async () => {
    userService.loginUser.mockResolvedValue({
      user: { id: "u1" },
      accessToken: "at",
      refreshToken: "rt"
    });
    const req = createMockReq({ body: { email: "a@b.com", password: "p" } });
    const res = createMockRes();
    const next = vi.fn();
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "rt", expect.any(Object));
  });
});

describe("refresh", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with new tokens", async () => {
    userService.refreshTokens.mockResolvedValue({
      user: { id: "u1" },
      accessToken: "at2",
      refreshToken: "rt2"
    });
    const req = createMockReq({ cookies: { refreshToken: "rt" } });
    const res = createMockRes();
    const next = vi.fn();
    await refresh(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "rt2", expect.any(Object));
  });
});

describe("logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 204 and clears cookie", async () => {
    userService.logoutUser.mockResolvedValue(true);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await logout(req, res, next);
    expect(res.clearCookie).toHaveBeenCalledWith(
      "refreshToken",
      expect.objectContaining({ maxAge: 0 })
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("still clears cookie when userId is missing", async () => {
    const req = createMockReq({ userId: null });
    const res = createMockRes();
    const next = vi.fn();
    await logout(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe("me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null user when no refresh token", async () => {
    const req = createMockReq({ cookies: {} });
    const res = createMockRes();
    const next = vi.fn();
    await me(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { user: null } });
  });

  it("returns user from refreshTokens", async () => {
    userService.refreshTokens.mockResolvedValue({
      user: { id: "u1", email: "a@b.com" }
    });
    const req = createMockReq({ cookies: { refreshToken: "rt" } });
    const res = createMockRes();
    const next = vi.fn();
    await me(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      data: { user: { id: "u1", email: "a@b.com" } }
    });
  });
});

describe("changePassword controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 on success", async () => {
    userService.changePassword.mockResolvedValue({ success: true });
    const req = createMockReq({
      userId: "u1",
      body: { currentPassword: "old", newPassword: "new" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await changePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Password changed" });
  });

  it("returns 401 when userId missing", async () => {
    const req = createMockReq({ userId: null, body: {} });
    const res = createMockRes();
    const next = vi.fn();
    await changePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("verifyEmailController", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with result", async () => {
    userService.verrtfiyEmail.mockResolvedValue({ message: "verified" });
    const req = createMockReq({ query: { token: "tok" } });
    const res = createMockRes();
    const next = vi.fn();
    await verifyEmailController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "verified" });
  });
});

describe("resendVerifyController", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with result", async () => {
    userService.resendVerification.mockResolvedValue({ message: "sent" });
    const req = createMockReq({ body: { email: "a@b.com" } });
    const res = createMockRes();
    const next = vi.fn();
    await resendVerifyController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { message: "sent" } });
  });
});

describe("googleCallback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets cookie and redirects", async () => {
    userService.oauthSignIn.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt"
    });
    const req = createMockReq({ user: { id: "u1" } });
    const res = createMockRes();
    const next = vi.fn();
    await googleCallback(req, res, next);
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "rt", expect.any(Object));
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining("accessToken=at")
    );
  });
});

describe("setPassword controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 on success", async () => {
    userService.setPassword.mockResolvedValue({ success: true });
    const req = createMockReq({
      userId: "u1",
      body: { newPassword: "newpwd" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await setPassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Password set" });
  });

  it("returns 401 when userId missing", async () => {
    const req = createMockReq({ userId: null, body: {} });
    const res = createMockRes();
    const next = vi.fn();
    await setPassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
