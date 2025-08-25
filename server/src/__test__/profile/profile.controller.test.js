import { jest, describe, it, expect, afterEach, beforeAll } from "@jest/globals";

jest.unstable_mockModule("../../lib/prisma.js", () => ({
  default: {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));


jest.unstable_mockModule("../../modules/profile/profile.service.js", async () => {
  const prisma = await import("../../lib/prisma.js");
  return {
    getUserProfile: jest.fn(async (userId) => {
      return prisma.default.profile.findUnique({ where: { userId } });
    }),
    updateUserProfile: jest.fn(async (userId, data) => {
      return prisma.default.profile.update({ where: { userId }, data });
    }),
  };
});

const profileService = await import("../../modules/profile/profile.service.js");
const profileController = await import("../../modules/profile/profile.controller.js");

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe("profileController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("returns profile data successfully", async () => {
      profileService.getUserProfile.mockResolvedValue({ userId: 1, firstName: "Beth" });

      const req = { userId: 1 };
      const res = createResponse();

      await profileController.getProfile(req, res, next);

      expect(profileService.getUserProfile).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { profile: { userId: 1, firstName: "Beth" } } });
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with error if service throws", async () => {
      const error = new Error("fail");
      profileService.getUserProfile.mockRejectedValue(error);

      const req = { userId: 1 };
      const res = createResponse();

      await profileController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("setProfile", () => {
    it("updates profile successfully", async () => {
      profileService.updateUserProfile.mockResolvedValue({ userId: 1, firstName: "Beth", lastName: "T" });

      const req = { userId: 1, body: { firstName: "Beth", lastName: "T" } };
      const res = createResponse();

      await profileController.setProfile(req, res, next);

      expect(profileService.updateUserProfile).toHaveBeenCalledWith(1, { firstName: "Beth", lastName: "T" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { profile: { userId: 1, firstName: "Beth", lastName: "T" } } });
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with error if service throws", async () => {
      const error = new Error("fail");
      profileService.updateUserProfile.mockRejectedValue(error);

      const req = { userId: 1, body: { firstName: "Beth" } };
      const res = createResponse();

      await profileController.setProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
