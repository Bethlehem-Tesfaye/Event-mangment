import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockReq } from "../../../__tests__/helpers/createMockReq.js";
import { createMockRes } from "../../../__tests__/helpers/createMockRes.js";

vi.mock("./speaker.service.js", () => ({
  createSpeaker: vi.fn(),
  getSpeakersForEvent: vi.fn(),
  updateSpeaker: vi.fn(),
  deleteSpeaker: vi.fn()
}));

const speakerService = await import("./speaker.service.js");
const {
  createSpeaker,
  getSpeakersForEvent,
  getPublicSpealersForEvent,
  updateSpeaker,
  deleteSpeaker
} = await import("./speaker.contollers.js");

describe("createSpeaker controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with speaker", async () => {
    speakerService.createSpeaker.mockResolvedValue({ id: 1, name: "Alice" });
    const req = createMockReq({
      params: { eventId: "e1" },
      body: { name: "Alice" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await createSpeaker(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("uses file path as photoUrl", async () => {
    speakerService.createSpeaker.mockResolvedValue({ id: 1 });
    const req = createMockReq({
      params: { eventId: "e1" },
      body: { name: "Alice" },
      file: { path: "/uploads/photo.jpg" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await createSpeaker(req, res, next);
    expect(speakerService.createSpeaker).toHaveBeenCalledWith(
      expect.objectContaining({ photoUrl: "/uploads/photo.jpg" })
    );
  });
});

describe("getSpeakersForEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with speakers", async () => {
    speakerService.getSpeakersForEvent.mockResolvedValue([{ id: 1 }]);
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await getSpeakersForEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("getPublicSpealersForEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with speakers", async () => {
    speakerService.getSpeakersForEvent.mockResolvedValue([{ id: 1 }]);
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await getPublicSpealersForEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("updateSpeaker controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with updated speaker", async () => {
    speakerService.updateSpeaker.mockResolvedValue({ id: 1 });
    const req = createMockReq({
      params: { speakerId: "1" },
      body: { name: "Bob" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await updateSpeaker(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("uses file path as photoUrl when file uploaded", async () => {
    speakerService.updateSpeaker.mockResolvedValue({ id: 1 });
    const req = createMockReq({
      params: { speakerId: "1" },
      body: { name: "Bob" },
      file: { path: "/uploads/new.jpg" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await updateSpeaker(req, res, next);
    expect(speakerService.updateSpeaker).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ photoUrl: "/uploads/new.jpg" })
    );
  });
});

describe("deleteSpeaker controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with deleted speaker", async () => {
    speakerService.deleteSpeaker.mockResolvedValue({ id: 1 });
    const req = createMockReq({ params: { speakerId: "1" } });
    const res = createMockRes();
    const next = vi.fn();
    await deleteSpeaker(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(speakerService.deleteSpeaker).toHaveBeenCalledWith("1");
  });
});
