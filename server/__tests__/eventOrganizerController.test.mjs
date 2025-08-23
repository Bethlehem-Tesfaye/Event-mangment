import { jest, test, expect, describe, it } from "@jest/globals";
import {
  createEvent,
  deleteDraftEvent,
  getAllCategories,
  getEventDetails,
  getEvents,
  updateEvent,
  updateEventStatus
} from "../controllers/eventOrganizerController";
import prisma from "../lib/prisma";
import CustomError from "../utils/customError";

jest.mock("../lib/prisma.js");

prisma.event = {
  create: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  findMany: jest.fn()
};
prisma.eventSpeaker = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn()
};
prisma.ticket = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findMany: jest.fn(),
  updateMany: jest.fn(),
  findFirst: jest.fn()
};
prisma.category = {
  findMany: jest.fn(),
  findFirst: jest.fn()
};
prisma.eventCategory = {
  findMany: jest.fn(),
  findFirst: jest.fn()
};
const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();
let req;

describe("eventOrganizeController tesr", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // createEvent
  describe("createEvent", () => {
    it("should create event and return 201", async () => {
      req = {
        body: {
          event: { title: "Test Event", description: "Desc" },
          categoryIds: [1, 2]
        },
        userId: 10
      };
      const mockEvent = { id: 1, title: "Test Event" };
      prisma.event.create.mockResolvedValue(mockEvent);

      const res = createResponse();

      await createEvent(req, res, next);

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Test Event",
          description: "Desc",
          userId: 10,
          eventCategories: {
            create: [
              { category: { connect: { id: 1 } } },
              { category: { connect: { id: 2 } } }
            ]
          }
        })
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: { event: mockEvent } });
    });

    it("should create event without categories", async () => {
      req = {
        body: {
          event: { title: "No Cats Event", description: "Desc" }
        },
        userId: 10
      };
      const mockEvent = { id: 2, title: "No Cats Event" };
      prisma.event.create.mockResolvedValue(mockEvent);
      const res = createResponse();

      await createEvent(req, res, next);

      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "No Cats Event",
            eventCategories: undefined
          })
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: { event: mockEvent } });
    });

    it("should call next on error", async () => {
      req = { body: {}, userId: 10 };
      const error = new Error("DB error");
      prisma.event.create.mockRejectedValue(error);

      const res = createResponse();
      await createEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getEventDetails
  describe("getEventDetails", () => {
    it("should return event details when found", async () => {
      req = { params: { id: "5" } };
      const mockEvent = { id: 5, title: "Sample Event" };
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      const res = createResponse();
      await getEventDetails(req, res, next);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        include: {
          tickets: { where: { deletedAt: null } },
          eventSpeakers: { where: { deletedAt: null } }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { event: mockEvent } });
    });

    it("should call next with CustomError if event not found", async () => {
      req = { params: { id: "5" } };
      prisma.event.findUnique.mockResolvedValue(null);

      const res = createResponse();
      await getEventDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const errArg = next.mock.calls[0][0];
      expect(errArg.message).toBe("event not found");
      expect(errArg.statusCode).toBe(404);
    });

    it("should call next on DB error", async () => {
      req = { params: { id: "5" } };
      const error = new Error("DB error");
      prisma.event.findUnique.mockRejectedValue(error);

      const res = createResponse();
      await getEventDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // updateEvent
  describe("updateEvent", () => {
    it("should update event and related data", async () => {
      req = {
        params: { id: "1" },
        userId: 10,
        body: {
          eventInfo: { title: "Updated Event" },
          speakers: [{ id: 1, name: "Speaker 1", bio: "Bio" }],
          tickets: [{ id: 1, type: "VIP", price: 100, totalQuantity: 10 }]
        }
      };

      prisma.event.findFirst.mockResolvedValue({ id: 1 });
      prisma.event.update.mockResolvedValue({ id: 1, title: "Updated Event" });
      prisma.eventSpeaker.findMany.mockResolvedValue([]);
      prisma.ticket.findMany.mockResolvedValue([]);

      const res = createResponse();
      await updateEvent(req, res, next);

      expect(prisma.event.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          event: expect.any(Object),
          speakers: [],
          tickets: []
        }
      });
    });

    it("should soft delete removed speakers and tickets and update/create the rest", async () => {
      req = {
        params: { id: "1" },
        userId: 10,
        body: {
          eventInfo: { title: "Updated Event" },
          speakers: [
            { id: 1, name: "Speaker Updated", bio: "Bio Updated" }, // existing speaker update
            { name: "New Speaker", bio: "New Bio" } // new speaker create
          ],
          tickets: [
            { id: 1, type: "VIP", price: 100, totalQuantity: 10 }, // existing ticket update
            { type: "Regular", price: 50, totalQuantity: 20 } // new ticket create
          ]
        }
      };

      prisma.event.findFirst.mockResolvedValue({ id: 1 });
      prisma.event.update.mockResolvedValue({ id: 1, title: "Updated Event" });
      prisma.eventSpeaker.findMany.mockResolvedValue([]);
      prisma.ticket.findMany.mockResolvedValue([]);

      const res = createResponse();
      await updateEvent(req, res, next);

      // Soft delete calls
      expect(prisma.eventSpeaker.updateMany).toHaveBeenCalled();
      expect(prisma.ticket.updateMany).toHaveBeenCalled();

      // Update calls
      expect(prisma.eventSpeaker.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      );
      expect(prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      );

      // Create calls
      expect(prisma.eventSpeaker.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: "New Speaker" })
        })
      );
      expect(prisma.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: "Regular" })
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          event: expect.any(Object),
          speakers: [],
          tickets: []
        }
      });
    });

    it("should return 404 if event not found", async () => {
      req = {
        params: { id: "1" },
        userId: 10,
        body: { eventInfo: {}, speakers: [], tickets: [] }
      };
      prisma.event.findFirst.mockResolvedValue(null);

      const res = createResponse();
      await updateEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should call next on DB error", async () => {
      req = { params: { id: "1" }, userId: 10 };
      req = {
        params: { id: "1" },
        userId: 10,
        body: { eventInfo: {}, speakers: [], tickets: [] }
      };
      const error = new Error("DB error");
      prisma.event.findFirst.mockRejectedValue(error);

      const res = createResponse();
      await updateEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getAllCategories
  describe("getAllCategories", () => {
    it("should return categories", async () => {
      req = {};
      const mockCategories = [{ id: 1, name: "Cat 1" }];
      prisma.category.findMany.mockResolvedValue(mockCategories);

      const res = createResponse();
      await getAllCategories(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { Categories: mockCategories }
      });
    });

    it("should call next on DB error", async () => {
      req = {};
      const error = new Error("DB error");
      prisma.category.findMany.mockRejectedValue(error);

      const res = createResponse();
      await getAllCategories(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  //   updateEventStatus
  describe("updateEventStatus", () => {
    it("should update event status", async () => {
      req = { params: { id: "1" }, body: { status: "draft" }, userId: 10 };
      prisma.event.findFirst.mockResolvedValue({ id: 1, title: "E" });
      prisma.event.update.mockResolvedValue({ id: 1, status: "draft" });

      const res = createResponse();
      await updateEventStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { event: { id: 1, status: "draft" } }
      });
    });
    it("should soft delete event when status is cancelled", async () => {
      req = { params: { id: "1" }, body: { status: "cancelled" }, userId: 10 };
      prisma.event.findFirst.mockResolvedValue({ id: 1, title: "E" });
      prisma.event.update.mockResolvedValue({
        id: 1,
        status: "cancelled",
        deletedAt: new Date()
      });

      const res = createResponse();
      await updateEventStatus(req, res, next);

      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "cancelled",
            deletedAt: expect.any(Date)
          })
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { event: expect.objectContaining({ status: "cancelled" }) }
      });
    });

    it("should return 404 if event not found", async () => {
      req = { params: { id: "1" }, body: { status: "draft" }, userId: 10 };
      prisma.event.findFirst.mockResolvedValue(null);

      const res = createResponse();
      await updateEventStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should return 400 if category is missing before publishing", async () => {
      req = { params: { id: "1" }, body: { status: "published" }, userId: 10 };

      prisma.event.findFirst.mockResolvedValue({ id: 1, title: "Event" });

      // missing category triggers error
      prisma.eventCategory.findFirst.mockResolvedValue(null);
      prisma.eventSpeaker.findFirst.mockResolvedValue({ id: 1 });
      prisma.ticket.findFirst.mockResolvedValue({ id: 1 });

      const res = createResponse();

      await updateEventStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const errArg = next.mock.calls[0][0];
      expect(errArg.message).toBe("Incomplete event data");
      expect(errArg.statusCode).toBe(400);
    });

    it("should return 400 if speaker is missing before publishing", async () => {
      req = { params: { id: "1" }, body: { status: "published" }, userId: 10 };

      prisma.event.findFirst.mockResolvedValue({ id: 1, title: "Event" });

      prisma.eventCategory.findFirst.mockResolvedValue({ id: 1 });
      prisma.eventSpeaker.findFirst.mockResolvedValue(null); // missing speaker
      prisma.ticket.findFirst.mockResolvedValue({ id: 1 });

      const res = createResponse();

      await updateEventStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const errArg = next.mock.calls[0][0];
      expect(errArg.message).toBe("Incomplete event data");
      expect(errArg.statusCode).toBe(400);
    });

    it("should return 400 if ticket is missing before publishing", async () => {
      req = { params: { id: "1" }, body: { status: "published" }, userId: 10 };

      prisma.event.findFirst.mockResolvedValue({ id: 1, title: "Event" });

      prisma.eventCategory.findFirst.mockResolvedValue({ id: 1 });
      prisma.eventSpeaker.findFirst.mockResolvedValue({ id: 1 });
      prisma.ticket.findFirst.mockResolvedValue(null); // missing ticket

      const res = createResponse();

      await updateEventStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const errArg = next.mock.calls[0][0];
      expect(errArg.message).toBe("Incomplete event data");
      expect(errArg.statusCode).toBe(400);
    });

    it("should call next on DB error", async () => {
      req = { params: { id: "1" }, body: { status: "draft" }, userId: 10 };
      const error = new Error("DB error");
      prisma.event.findFirst.mockRejectedValue(error);

      const res = createResponse();
      await updateEventStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  //   deleteDraftEvent
  describe("deleteDraftEvent", () => {
    it("should delete draft event", async () => {
      req = { params: { id: "1" }, userId: 10 };
      prisma.event.updateMany.mockResolvedValue({ count: 1 });

      const res = createResponse();
      await deleteDraftEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { event: { count: 1 } }
      });
    });

    it("should return 404 if draft not found", async () => {
      req = { params: { id: "1" }, userId: 10 };
      prisma.event.updateMany.mockResolvedValue({ count: 0 });

      const res = createResponse();
      await deleteDraftEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should call next on DB error", async () => {
      req = { params: { id: "1" }, userId: 10 };
      const error = new Error("DB error");
      prisma.event.updateMany.mockRejectedValue(error);

      const res = createResponse();
      await deleteDraftEvent(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getEvents
  describe("getEvents", () => {
    it("should return events list", async () => {
      req = { query: {}, userId: 10 };
      const mockEvents = [{ id: 1 }];
      prisma.event.findMany.mockResolvedValue(mockEvents);

      const res = createResponse();
      await getEvents(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { events: mockEvents } });
    });
    it("should filter events by status", async () => {
      req = { query: { status: "published" }, userId: 10 };
      const mockEvents = [{ id: 1, status: "published" }];
      prisma.event.findMany.mockResolvedValue(mockEvents);

      const res = createResponse();
      await getEvents(req, res, next);

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "published"
          })
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { events: mockEvents } });
    });

    it("should call next on DB error", async () => {
      req = { query: {}, userId: 10 };
      const error = new Error("DB error");
      prisma.event.findMany.mockRejectedValue(error);

      const res = createResponse();
      await getEvents(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
