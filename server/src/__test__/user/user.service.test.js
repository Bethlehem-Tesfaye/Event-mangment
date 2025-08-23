import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jest, describe, it, expect, afterEach } from "@jest/globals";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser
} from "../../modules/user/user.service.js";

import prisma from "../../lib/prisma.js";

import CustomError from "../../utils/customError.js";

prisma.user = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

jest.mock("../../lib/prisma.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();
jwt.sign = jest.fn();
jwt.verify = jest.fn();

describe("userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // registerUser
  describe("registerUser", () => {
    it("throws CustomError if email already registered", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com"
      });

      await expect(
        registerUser({ id: 1, email: "test@example.com" })
      ).rejects.toThrow(CustomError);
    });

    it("registers successfully and returns user + tokens", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        tokenVersion: 1
      });
      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");
      prisma.user.update.mockResolvedValue({ id: 1 });

      const result = await registerUser({
        email: "test@example.com",
        password: "123"
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("123", 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            password: "hashedPassword"
          }),
          select: expect.any(Object)
        })
      );
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { refreshTokenHash: "hashedPassword" } || expect.any(Object)
        })
      );
      expect(result).toEqual({
        user: { id: 1, email: "test@example.com" },
        accessToken: "accessToken",
        refreshToken: "refreshToken"
      });
    });

    it("throws if prisma create fails", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      prisma.user.create.mockRejectedValue(new Error("fail"));

      await expect(
        registerUser({ email: "test@example.com", password: "123" })
      ).rejects.toThrow(Error);
    });
  });

  // loginUser
  describe("loginUser", () => {
    it("throws if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser({ email: "test@example.com", password: "123" })
      ).rejects.toThrow(CustomError);
    });

    it("throws if password mismatch", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        tokenVersion: 1
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        loginUser({ email: "test@example.com", password: "wrong" })
      ).rejects.toThrow(CustomError);
    });

    it("logs in successfully and returns user + tokens", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        tokenVersion: 1
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("refreshToken");
      prisma.user.update.mockResolvedValue({ id: 1 });

      const result = await loginUser({
        email: "test@example.com",
        password: "hashed"
      });

      expect(bcrypt.compare).toHaveBeenCalledWith("hashed", "hashed");
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: { id: 1, email: "test@example.com" },
        accessToken: "accessToken",
        refreshToken: "refreshToken"
      });
    });
  });

  // refreshTokens
  describe("refreshTokens", () => {
    it("throws if no token provided", async () => {
      await expect(refreshTokens(null)).rejects.toThrow(CustomError);
    });

    it("throws if jwt.verify fails", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("invalid");
      });
      await expect(refreshTokens("token")).rejects.toThrow(CustomError);
    });

    it("throws if user not found", async () => {
      jwt.verify.mockReturnValue({ userId: 1, tv: 1 });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(refreshTokens("token")).rejects.toThrow(CustomError);
    });

    it("throws if token version mismatch", async () => {
      jwt.verify.mockReturnValue({ userId: 1, tv: 1 });
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        tokenVersion: 2,
        refreshTokenHash: "hash"
      });

      await expect(refreshTokens("token")).rejects.toThrow(CustomError);
    });

    it("throws if refresh token does not match hash", async () => {
      jwt.verify.mockReturnValue({ userId: 1, tv: 1 });
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        tokenVersion: 1,
        refreshTokenHash: "hash"
      });
      bcrypt.compare.mockResolvedValue(false);
      prisma.user.update.mockResolvedValue({ id: 1 });

      await expect(refreshTokens("token")).rejects.toThrow(CustomError);
    });

    it("refreshes tokens successfully", async () => {
      jwt.verify.mockReturnValue({ userId: 1, tv: 1 });
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        tokenVersion: 1,
        refreshTokenHash: "hash"
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce("accessToken")
        .mockReturnValueOnce("newRefreshToken");
      prisma.user.update.mockResolvedValue({ id: 1 });

      const result = await refreshTokens("token");

      expect(result).toEqual({
        user: { id: 1, email: "test@example.com" },
        accessToken: "accessToken",
        refreshToken: "newRefreshToken"
      });
    });
  });

  // logoutUser
  describe("logoutUser", () => {
    it("logs out successfully", async () => {
      prisma.user.update.mockResolvedValue({ id: 1 });
      const result = await logoutUser(1);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { refreshTokenHash: null },
          select: { id: true }
        })
      );
      expect(result).toBe(true);
    });

    it("throws if update fails", async () => {
      prisma.user.update.mockRejectedValue(new Error("fail"));
      await expect(logoutUser(1)).rejects.toThrow(Error);
    });
  });
});
