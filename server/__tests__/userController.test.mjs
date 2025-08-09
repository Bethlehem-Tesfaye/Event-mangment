import { jest, test, expect, describe } from "@jest/globals";
import {
  register,
  login,
  logout,
  getProfile,
  setProfile
} from "../controllers/userControllers.js";

import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";
prisma.user = {
  findUnique: jest.fn(),
  create: jest.fn()
};
prisma.profile = {
  findUnique: jest.fn(),
  update: jest.fn()
};

jest.mock("../lib/prisma.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();
jwt.sign = jest.fn();
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

  // register

  describe("register", () => {
    it("calls next with error if email already registered", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com"
      });

      const req = { body: { email: "test@example.com", password: "pass" } };
      const res = createResponse();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("registers user successfully and sets cookie", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: "test@example.com"
      });
      jwt.sign.mockReturnValue("fakeToken");

      const req = { body: { email: "test@example.com", password: "pass" } };
      const res = createResponse();

      await register(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            password: "hashedPassword"
          }),
          select: expect.any(Object)
        })
      );
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, process.env.JWT_SECRET, {
        expiresIn: "1d"
      });
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "fakeToken",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { user: { id: 1, email: "test@example.com" } }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    describe("production mode cookie options", () => {
      let originalEnv;

      beforeAll(() => {
        originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
      });

      afterAll(() => {
        process.env.NODE_ENV = originalEnv;
      });

      it("register sets cookie with production settings", async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashedPassword");
        prisma.user.create.mockResolvedValue({
          id: 1,
          email: "prod@example.com"
        });
        jwt.sign.mockReturnValue("fakeToken");

        const req = { body: { email: "prod@example.com", password: "pass" } };
        const res = createResponse();

        await register(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith(
          "token",
          "fakeToken",
          expect.objectContaining({
            sameSite: "None",
            secure: true
          })
        );
      });

      it("login sets cookie with production settings", async () => {
        prisma.user.findUnique.mockResolvedValue({
          id: 1,
          email: "prod@example.com",
          password: "hashedpass"
        });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("fakeToken");

        const req = { body: { email: "prod@example.com", password: "pass" } };
        const res = createResponse();

        await login(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith(
          "token",
          "fakeToken",
          expect.objectContaining({
            sameSite: "None",
            secure: true
          })
        );
      });

      it("logout clears cookie with production settings", async () => {
        const req = {};
        const res = createResponse();

        await logout(req, res, next);

        expect(res.clearCookie).toHaveBeenCalledWith(
          "token",
          expect.objectContaining({
            sameSite: "None",
            secure: true
          })
        );
      });
    });

    it("calls next with error if prisma fails", async () => {
      prisma.user.findUnique.mockRejectedValue(new Error("DB failure"));

      const req = { body: { email: "fail@example.com", password: "pass" } };
      const res = createResponse();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // login
  describe("login", () => {
    it("calls next with error if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const req = { body: { email: "noone@example.com", password: "pass" } };
      const res = createResponse();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next with error if password mismatch", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedpass"
      });
      bcrypt.compare.mockResolvedValue(false);

      const req = {
        body: { email: "test@example.com", password: "wrongpass" }
      };
      const res = createResponse();

      await login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith("wrongpass", "hashedpass");
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("logs in successfully and sets cookie", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedpass"
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fakeToken");

      const req = { body: { email: "test@example.com", password: "pass" } };
      const res = createResponse();

      await login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith("pass", "hashedpass");
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, process.env.JWT_SECRET, {
        expiresIn: "1d"
      });
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "fakeToken",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { user: { id: 1, email: "test@example.com" } }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with error if prisma fails", async () => {
      prisma.user.findUnique.mockRejectedValue(new Error("DB failure"));

      const req = { body: { email: "fail@example.com", password: "pass" } };
      const res = createResponse();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // logout
  describe("logout", () => {
    it("clears cookie and sends 204 status", async () => {
      const req = {};
      const res = createResponse();

      await logout(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with error on failure", async () => {
      const req = {};
      const res = createResponse();
      res.clearCookie.mockImplementation(() => {
        throw new Error("fail");
      });

      await logout(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
  // get profile
  describe("getProfile", () => {
    it("returns profile data successfully", async () => {
      prisma.profile.findUnique.mockResolvedValue({
        userId: 1,
        firstName: "Beth"
      });

      const req = { userId: 1 };
      const res = createResponse();

      await getProfile(req, res, next);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { profile: { userId: 1, firstName: "Beth" } }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with CustomError if no profile found", async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      const req = { userId: 1 };
      const res = createResponse();

      await getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next with error if prisma fails", async () => {
      prisma.profile.findUnique.mockRejectedValue(new Error("fail"));

      const req = { userId: 1 };
      const res = createResponse();

      await getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // setprofile

  describe("setProfile", () => {
    it("updates profile successfully", async () => {
      prisma.profile.update.mockResolvedValue({
        userId: 1,
        firstName: "Beth",
        lastName: "T"
      });

      const req = {
        userId: 1,
        body: {
          firstName: "Beth",
          lastName: "T",
          phone: "1234",
          address: "X",
          country: "Y",
          city: "Z"
        }
      };
      const res = createResponse();

      await setProfile(req, res, next);

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          firstName: "Beth",
          lastName: "T",
          phone: "1234",
          address: "X",
          country: "Y",
          city: "Z"
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { profile: { userId: 1, firstName: "Beth", lastName: "T" } }
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with CustomError if profile not found (P2025)", async () => {
      const error = new Error("Not found");
      error.code = "P2025";
      prisma.profile.update.mockRejectedValue(error);

      const req = {
        userId: 1,
        body: { firstName: "Beth" }
      };
      const res = createResponse();

      await setProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next with error on other failures", async () => {
      prisma.profile.update.mockRejectedValue(new Error("fail"));

      const req = {
        userId: 1,
        body: { firstName: "Beth" }
      };
      const res = createResponse();

      await setProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
