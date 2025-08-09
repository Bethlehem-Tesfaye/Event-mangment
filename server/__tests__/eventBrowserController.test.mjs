import { jest, test, expect, describe, it } from "@jest/globals";
import { getAllEvents, getEventPreview } from "../controllers/eventBrowserController.js";
import prisma from "../lib/prisma.js";
import CustomError from "../utils/customError.js";

jest.mock("../lib/prisma.js");
prisma.event= {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  }

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("browseEventsController", () => {
  let req, res, next;

  beforeEach(() => {
    res = createResponse();
    next = jest.fn();
  });

//   getAllEvent
  describe("getAllEvents", () => {
    it("should return events if found", async () => {
      const events = [{ id: 1, name: "Event 1" }];
      prisma.event.findMany.mockResolvedValue(events);

      req = {};
      await getAllEvents(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: events });
    });

    it("should return 404 if no events", async () => {
      prisma.event.findMany.mockResolvedValue([]);

      req = {};
      await getAllEvents(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should call next on DB error", async () => {
      const error = new Error("DB error");
      prisma.event.findMany.mockRejectedValue(error);

      req = {};
      await getAllEvents(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

//   getEventPreview
  describe("getEventPreview", () => {
    it("should return event preview if found", async () => {
      const event = { id: 1, name: "Event 1" };
      prisma.event.findFirst.mockResolvedValue(event);

      req = { params: { id: "1" } };
      await getEventPreview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ event });
    });

    it("should return 404 if event not found", async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      req = { params: { id: "1" } };
      await getEventPreview(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should call next on DB error", async () => {
      const error = new Error("DB error");
      prisma.event.findFirst.mockRejectedValue(error);

      req = { params: { id: "1" } };
      await getEventPreview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
