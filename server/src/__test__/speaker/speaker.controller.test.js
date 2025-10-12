import {
  jest,
  describe,
  it,
  expect,
  afterEach,
  beforeEach
} from "@jest/globals";

jest.unstable_mockModule("../../modules/speaker/speaker.service.js", () => ({
  createSpeaker: jest.fn(),
  getSpeakersForEvent: jest.fn(),
  updateSpeaker: jest.fn(),
  deleteSpeaker: jest.fn()
}));

const speakerService = await import("../../modules/speaker/speaker.service.js");
const speakerController = await import(
  "../../modules/speaker/speaker.contollers.js"
);

describe("speakerController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // createSpeaker
  describe("createSpeaker", () => {
    it("creates a speaker and returns 201", async () => {
      const mockSpeaker = { id: 1, name: "John Doe" };
      req.params.eventId = "10";
      req.body = { name: "John Doe" };
      speakerService.createSpeaker.mockResolvedValue(mockSpeaker);

      await speakerController.createSpeaker(req, res, next);

      expect(speakerService.createSpeaker).toHaveBeenCalledWith({
        eventId: "10",
        name: "John Doe"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: mockSpeaker });
    });

    it("calls next(err) on failure", async () => {
      const error = new Error("fail");
      speakerService.createSpeaker.mockRejectedValue(error);

      await speakerController.createSpeaker(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getSpeakersForEvent
  describe("getSpeakersForEvent", () => {
    it("returns speakers with 200", async () => {
      const speakers = [{ id: 1, name: "S1" }];
      req.params.eventId = "10";
      speakerService.getSpeakersForEvent.mockResolvedValue(speakers);

      await speakerController.getSpeakersForEvent(req, res, next);

      expect(speakerService.getSpeakersForEvent).toHaveBeenCalledWith("10");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: speakers });
    });

    it("calls next(err) on failure", async () => {
      const error = new Error("fail");
      speakerService.getSpeakersForEvent.mockRejectedValue(error);

      await speakerController.getSpeakersForEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getPublicSpealersForEvent
  describe("getPublicSpealersForEvent", () => {
    it("returns speakers with 200", async () => {
      const speakers = [{ id: 1, name: "Public S1" }];
      req.params.eventId = "20";
      speakerService.getSpeakersForEvent.mockResolvedValue(speakers);

      await speakerController.getPublicSpealersForEvent(req, res, next);

      expect(speakerService.getSpeakersForEvent).toHaveBeenCalledWith("20");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: speakers });
    });

    it("calls next(err) on failure", async () => {
      const error = new Error("fail");
      speakerService.getSpeakersForEvent.mockRejectedValue(error);

      await speakerController.getPublicSpealersForEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // updateSpeaker
  describe("updateSpeaker", () => {
    it("updates a speaker and returns 200", async () => {
      const updated = { id: 1, name: "Updated" };
      req.params.speakerId = "5";
      req.body = { name: "Updated" };
      speakerService.updateSpeaker.mockResolvedValue(updated);

      await speakerController.updateSpeaker(req, res, next);

      expect(speakerService.updateSpeaker).toHaveBeenCalledWith("5", {
        name: "Updated"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: updated });
    });

    it("calls next(err) on failure", async () => {
      const error = new Error("fail");
      speakerService.updateSpeaker.mockRejectedValue(error);

      await speakerController.updateSpeaker(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // deleteSpeaker
  describe("deleteSpeaker", () => {
    it("soft deletes speaker and returns 200", async () => {
      const deleted = { id: 1, deletedAt: new Date() };
      req.params.speakerId = "7";
      speakerService.deleteSpeaker.mockResolvedValue(deleted);

      await speakerController.deleteSpeaker(req, res, next);

      expect(speakerService.deleteSpeaker).toHaveBeenCalledWith("7");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: deleted });
    });

    it("calls next(err) on failure", async () => {
      const error = new Error("fail");
      speakerService.deleteSpeaker.mockRejectedValue(error);

      await speakerController.deleteSpeaker(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
