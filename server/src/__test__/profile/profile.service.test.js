import { jest, describe, it, expect, afterEach } from "@jest/globals";
import * as profileService from "../../modules/profile/profile.service.js";
import CustomError from "../../utils/customError.js";

// Import prisma first
import prisma from "../../lib/prisma.js";

// Mock prisma methods explicitly after import
prisma.profile = {
  findUnique: jest.fn(),
  update: jest.fn()
};

describe("profile.service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("returns profile data if found", async () => {
      const mockProfile = { userId: 1, firstName: "Beth" };
      prisma.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await profileService.getUserProfile(1);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual(mockProfile);
    });

    it("throws CustomError if profile not found", async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(profileService.getUserProfile(1))
        .rejects
        .toThrow(CustomError);
    });

    it("throws other errors if prisma fails", async () => {
      prisma.profile.findUnique.mockRejectedValue(new Error("DB failure"));

      await expect(profileService.getUserProfile(1))
        .rejects
        .toThrow("DB failure");
    });
  });

  describe("updateUserProfile", () => {
    it("updates and returns profile successfully", async () => {
      const updatedProfile = { userId: 1, firstName: "Beth", lastName: "T" };
      prisma.profile.update.mockResolvedValue(updatedProfile);

      const result = await profileService.updateUserProfile(1, { firstName: "Beth", lastName: "T" });

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { firstName: "Beth", lastName: "T" }
      });
      expect(result).toEqual(updatedProfile);
    });

    it("throws CustomError with code P2025 if profile not found", async () => {
      const error = new Error("Not found");
      error.code = "P2025";
      prisma.profile.update.mockRejectedValue(error);

      await expect(profileService.updateUserProfile(1, {}))
        .rejects
        .toThrow(CustomError);
    });

    it("throws other errors on failure", async () => {
      prisma.profile.update.mockRejectedValue(new Error("DB failure"));

      await expect(profileService.updateUserProfile(1, {}))
        .rejects
        .toThrow("DB failure");
    });
  });
});
