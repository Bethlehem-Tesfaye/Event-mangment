import { jest, describe, it, expect, afterEach } from "@jest/globals";
import {
  createSpeaker,
  updateSpeaker,
  getSpeakersForEvent,
  deleteSpeaker,
} from "../../modules/speaker/speaker.service.js";

import prisma from "../../lib/prisma.js";
import CustomError from "../../utils/customError.js";

// Mock prisma methods
prisma.eventSpeaker = {
  create: jest.fn(),
  update: jest.fn(),
  findMany: jest.fn(),
};

jest.mock("../../lib/prisma.js");

describe("speakerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // createSpeaker
  describe("createSpeaker", () => {
    it("creates a speaker successfully", async () => {
      const mockSpeaker = {
        id: 1,
        eventId: 10,
        name: "John Doe",
        bio: "Bio",
        photoUrl: "url",
      };

      prisma.eventSpeaker.create.mockResolvedValue(mockSpeaker);

      const result = await createSpeaker({
        eventId: 10,
        name: "John Doe",
        bio: "Bio",
        photoUrl: "url",
      });

      expect(prisma.eventSpeaker.create).toHaveBeenCalledWith({
        data: {
          eventId: 10,
          name: "John Doe",
          bio: "Bio",
          photoUrl: "url",
        },
      });
      expect(result).toEqual(mockSpeaker);
    });

    it("throws if prisma.create fails", async () => {
      prisma.eventSpeaker.create.mockRejectedValue(new Error("fail"));

      await expect(
        createSpeaker({ eventId: 10, name: "X", bio: "Y", photoUrl: "Z" })
      ).rejects.toThrow(Error);
    });
  });

  // updateSpeaker
  describe("updateSpeaker", () => {
    it("updates a speaker successfully", async () => {
      const updatedSpeaker = { id: 1, name: "Jane Doe" };
      prisma.eventSpeaker.update.mockResolvedValue(updatedSpeaker);

      const result = await updateSpeaker(1, { name: "Jane Doe" });

      expect(prisma.eventSpeaker.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ name: "Jane Doe" }),
      });
      expect(result).toEqual(updatedSpeaker);
    });

    it("throws if prisma.update fails", async () => {
      prisma.eventSpeaker.update.mockRejectedValue(new Error("fail"));

      await expect(updateSpeaker(1, { name: "Fail" })).rejects.toThrow(Error);
    });
  });

  // getSpeakersForEvent
  describe("getSpeakersForEvent", () => {
    it("returns speakers if found", async () => {
      const speakers = [
        { id: 1, name: "Speaker1", bio: "Bio1", photoUrl: "url1" },
      ];
      prisma.eventSpeaker.findMany.mockResolvedValue(speakers);

      const result = await getSpeakersForEvent(10);

      expect(prisma.eventSpeaker.findMany).toHaveBeenCalledWith({
        where: { eventId: 10, deletedAt: null },
        select: { id: true, name: true, bio: true, photoUrl: true },
      });
      expect(result).toEqual(speakers);
    });

    it("throws CustomError if no speakers found", async () => {
      prisma.eventSpeaker.findMany.mockResolvedValue([]);

      await expect(getSpeakersForEvent(10)).rejects.toThrow(CustomError);
    });
  });

  // deleteSpeaker
  describe("deleteSpeaker", () => {
    it("soft deletes a speaker", async () => {
      const deleted = { id: 1, deletedAt: new Date() };
      prisma.eventSpeaker.update.mockResolvedValue(deleted);

      const result = await deleteSpeaker(1);

      expect(prisma.eventSpeaker.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(deleted);
    });

    it("throws if prisma.update fails", async () => {
      prisma.eventSpeaker.update.mockRejectedValue(new Error("fail"));

      await expect(deleteSpeaker(1)).rejects.toThrow(Error);
    });
  });
});
