import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  eventSpeaker: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn()
  }
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));

const { createSpeaker, updateSpeaker, getSpeakersForEvent, deleteSpeaker } =
  await import("./speaker.service.js");

describe("createSpeaker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a speaker with given data", async () => {
    const speaker = { id: 1, eventId: "e1", name: "Alice" };
    mockPrisma.eventSpeaker.create.mockResolvedValue(speaker);
    const result = await createSpeaker({
      eventId: "e1",
      name: "Alice",
      bio: "Dev",
      photoUrl: "https://img.com/a.jpg"
    });
    expect(result).toEqual(speaker);
    expect(mockPrisma.eventSpeaker.create).toHaveBeenCalledWith({
      data: {
        eventId: "e1",
        name: "Alice",
        bio: "Dev",
        photoUrl: "https://img.com/a.jpg"
      }
    });
  });
});

describe("updateSpeaker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates speaker and adds updatedAt", async () => {
    const updated = { id: 1, name: "Bob" };
    mockPrisma.eventSpeaker.update.mockResolvedValue(updated);
    const result = await updateSpeaker("1", { name: "Bob" });
    expect(result).toEqual(updated);
    const call = mockPrisma.eventSpeaker.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.data.name).toBe("Bob");
    expect(call.data.updatedAt).toBeInstanceOf(Date);
  });
});

describe("getSpeakersForEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns speakers for event", async () => {
    const speakers = [{ id: 1, name: "Alice" }];
    mockPrisma.eventSpeaker.findMany.mockResolvedValue(speakers);
    const result = await getSpeakersForEvent("e1");
    expect(result).toEqual(speakers);
  });

  it("throws 404 when no speakers found", async () => {
    mockPrisma.eventSpeaker.findMany.mockResolvedValue([]);
    await expect(getSpeakersForEvent("e1")).rejects.toThrow(
      "No speakers found for this event"
    );
  });
});

describe("deleteSpeaker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("soft-deletes speaker", async () => {
    mockPrisma.eventSpeaker.update.mockResolvedValue({ id: 1 });
    const result = await deleteSpeaker("1");
    expect(result).toEqual({ id: 1 });
    const call = mockPrisma.eventSpeaker.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });
});
