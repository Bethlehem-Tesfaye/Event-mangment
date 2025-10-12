import { jest, describe, it, expect, afterEach } from "@jest/globals";

// Mock user service
jest.unstable_mockModule("../../modules/user/user.service.js", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  refreshTokens: jest.fn(),
  logoutUser: jest.fn()
}));

const userService = await import("../../modules/user/user.service.js");
const userController = await import("../../modules/user/user.controller.js");

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe("userController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("calls service and returns 201 with cookie", async () => {
      const req = { body: { email: "test@example.com", password: "pass" } };
      const res = createResponse();

      userService.registerUser.mockResolvedValue({
        user: { id: 1, email: "test@example.com" },
        accessToken: "access123",
        refreshToken: "refresh123"
      });

      await userController.register(req, res, next);

      expect(userService.registerUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh123",
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: { id: 1, email: "test@example.com" },
            accessToken: "access123"
          }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next on service error", async () => {
      const req = { body: {} };
      const res = createResponse();
      const error = new Error("fail");
      userService.registerUser.mockRejectedValue(error);

      await userController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("calls service and returns 200 with cookie", async () => {
      const req = { body: { email: "test@example.com", password: "pass" } };
      const res = createResponse();

      userService.loginUser.mockResolvedValue({
        user: { id: 1, email: "test@example.com" },
        accessToken: "access123",
        refreshToken: "refresh123"
      });

      await userController.login(req, res, next);

      expect(userService.loginUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh123",
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: { id: 1, email: "test@example.com" },
            accessToken: "access123"
          }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next on service error", async () => {
      const req = { body: {} };
      const res = createResponse();
      const error = new Error("fail");
      userService.loginUser.mockRejectedValue(error);

      await userController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("refresh", () => {
    it("calls service with cookie and returns 200", async () => {
      const req = { cookies: { refreshToken: "refresh123" } };
      const res = createResponse();

      userService.refreshTokens.mockResolvedValue({
        user: { id: 1, email: "test@example.com" },
        accessToken: "access123",
        refreshToken: "refresh456"
      });

      await userController.refresh(req, res, next);

      expect(userService.refreshTokens).toHaveBeenCalledWith("refresh123");
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh456",
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: { id: 1, email: "test@example.com" },
            accessToken: "access123"
          }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next on service error", async () => {
      const req = { cookies: {} };
      const res = createResponse();
      const error = new Error("fail");
      userService.refreshTokens.mockRejectedValue(error);

      await userController.refresh(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("logout", () => {
    it("calls service and clears cookie", async () => {
      const req = { userId: 1 };
      const res = createResponse();

      userService.logoutUser.mockResolvedValue(true);

      await userController.logout(req, res, next);

      expect(userService.logoutUser).toHaveBeenCalledWith(1);
      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({ maxAge: 0 })
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next on service error", async () => {
      const req = { userId: 1 };
      const res = createResponse();
      const error = new Error("fail");
      userService.logoutUser.mockRejectedValue(error);

      await userController.logout(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
