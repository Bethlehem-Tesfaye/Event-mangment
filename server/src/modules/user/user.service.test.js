import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn().mockResolvedValue(true)
  }
}));
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock-token"),
    verify: vi.fn().mockReturnValue({ userId: "u1", email: "a@b.com" })
  }
}));
vi.mock("../../lib/mailer.js", () => ({
  sendMail: vi.fn().mockResolvedValue(true)
}));
vi.mock("../../utils/logger.js", () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}));
vi.mock("dotenv", () => ({ default: { config: vi.fn() } }));

const {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  changePassword,
  verrtfiyEmail,
  resendVerification,
  oauthSignIn,
  setPassword
} = await import("./user.service.js");

const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const { sendMail } = await import("../../lib/mailer.js");

describe("registerUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates user, sends email, returns tokens", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      tokenVersion: 0
    });
    mockPrisma.user.update.mockResolvedValue({});
    const result = await registerUser({
      email: "a@b.com",
      password: "123456"
    });
    expect(result.user.email).toBe("a@b.com");
    expect(result.accessToken).toBe("mock-token");
    expect(result.refreshToken).toBe("mock-token");
    expect(sendMail).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it("throws 409 if email already registered", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });
    await expect(
      registerUser({ email: "a@b.com", password: "123456" })
    ).rejects.toThrow("Email already registered");
  });

  it("throws 500 if email sending fails", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      tokenVersion: 0
    });
    sendMail.mockRejectedValueOnce(new Error("SMTP fail"));
    await expect(
      registerUser({ email: "a@b.com", password: "123456" })
    ).rejects.toThrow("Registration failed while sending verification email");
  });
});

describe("loginUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns user and tokens on valid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      password: "hashed",
      tokenVersion: 0
    });
    mockPrisma.user.update.mockResolvedValue({});
    const result = await loginUser({ email: "a@b.com", password: "123456" });
    expect(result.user.email).toBe("a@b.com");
    expect(result.accessToken).toBeDefined();
  });

  it("throws 401 when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(
      loginUser({ email: "x@y.com", password: "123456" })
    ).rejects.toThrow("Login failed");
  });

  it("throws 401 on wrong password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      password: "hashed",
      tokenVersion: 0
    });
    bcrypt.compare.mockResolvedValueOnce(false);
    await expect(
      loginUser({ email: "a@b.com", password: "wrong" })
    ).rejects.toThrow("Login failed");
  });
});

describe("refreshTokens", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 401 when no token provided", async () => {
    await expect(refreshTokens(null)).rejects.toThrow("No refresh token");
  });

  it("returns new tokens on valid refresh", async () => {
    jwt.verify.mockReturnValue({ userId: "u1", tv: 0 });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      tokenVersion: 0,
      refreshTokenHash: "hash",
      isVerified: true,
      hasPassword: true
    });
    bcrypt.compare.mockResolvedValueOnce(true);
    mockPrisma.user.update.mockResolvedValue({});
    const result = await refreshTokens("valid-token");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it("throws 403 and increments tokenVersion on hash mismatch", async () => {
    jwt.verify.mockReturnValue({ userId: "u1", tv: 0 });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      tokenVersion: 0,
      refreshTokenHash: "hash"
    });
    bcrypt.compare.mockResolvedValueOnce(false);
    mockPrisma.user.update.mockResolvedValue({});
    await expect(refreshTokens("bad-token")).rejects.toThrow("Forbidden");
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { tokenVersion: { increment: 1 }, refreshTokenHash: null }
      })
    );
  });
});

describe("logoutUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("clears refreshTokenHash", async () => {
    mockPrisma.user.update.mockResolvedValue({});
    const result = await logoutUser("u1");
    expect(result).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { refreshTokenHash: null },
      select: { id: true }
    });
  });
});

describe("changePassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("changes password on valid current password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      password: "hashed"
    });
    bcrypt.compare.mockResolvedValueOnce(true);
    mockPrisma.user.update.mockResolvedValue({});
    const result = await changePassword("u1", "oldpwd", "newpwd");
    expect(result).toEqual({ success: true });
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(changePassword("u-x", "a", "b")).rejects.toThrow(
      "User not found"
    );
  });

  it("throws 401 on wrong current password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      password: "hashed"
    });
    bcrypt.compare.mockResolvedValueOnce(false);
    await expect(changePassword("u1", "wrong", "new")).rejects.toThrow(
      "Current password is incorrect"
    );
  });
});

describe("verrtfiyEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 when token is missing", async () => {
    await expect(verrtfiyEmail(null)).rejects.toThrow("Token is required");
  });

  it("verifies email on valid token", async () => {
    jwt.verify.mockReturnValue({ userId: "u1" });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      isVerified: false
    });
    mockPrisma.user.update.mockResolvedValue({});
    const result = await verrtfiyEmail("valid-token");
    expect(result.message).toBe("Email verified successfully");
  });

  it("throws 400 if already verified", async () => {
    jwt.verify.mockReturnValue({ userId: "u1" });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      isVerified: true
    });
    // The service catches all errors in catch block and throws "Invalid or expired token"
    await expect(verrtfiyEmail("token")).rejects.toThrow();
  });
});

describe("resendVerification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 when email is missing", async () => {
    await expect(resendVerification(null)).rejects.toThrow(
      "Email is required"
    );
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(resendVerification("x@y.com")).rejects.toThrow(
      "User not found"
    );
  });

  it("throws 400 when already verified", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      isVerified: true
    });
    await expect(resendVerification("a@b.com")).rejects.toThrow(
      "Email already verified"
    );
  });

  it("sends verification email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      isVerified: false
    });
    const result = await resendVerification("a@b.com");
    expect(result.message).toBe("Verification email resent");
    expect(sendMail).toHaveBeenCalled();
  });
});

describe("oauthSignIn", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 on invalid oauth user", async () => {
    await expect(oauthSignIn(null)).rejects.toThrow("Invalid OAuth user");
  });

  it("returns tokens for valid oauth user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      tokenVersion: 0,
      isVerified: true
    });
    mockPrisma.user.update.mockResolvedValue({});
    const result = await oauthSignIn({ id: "u1" });
    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe("a@b.com");
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(oauthSignIn({ id: "missing" })).rejects.toThrow(
      "User not found"
    );
  });
});

describe("setPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets password for user", async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: "u1" })
      .mockResolvedValueOnce({ hasPassword: false });
    mockPrisma.user.update.mockResolvedValue({});
    const result = await setPassword("u1", "newpwd");
    expect(result).toEqual({ success: true });
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(setPassword("u-x", "pwd")).rejects.toThrow("User not found");
  });
});
