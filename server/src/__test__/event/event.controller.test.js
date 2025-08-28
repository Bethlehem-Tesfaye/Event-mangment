import { jest, describe, it, beforeEach, afterEach, expect } from "@jest/globals";

jest.unstable_mockModule("../../modules/event/event.service.js", () => ({
  getEvents: jest.fn(),
  getEventById: jest.fn(),
  purchaseTicket: jest.fn(),
  getEventAttendeesService: jest.fn(),
  createEvent: jest.fn(),
  getEventDetailById: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  addCategoryToEvent: jest.fn(),
  removeCategoryFromEvent: jest.fn(),
  getEventAnalytics: jest.fn(),
}));

jest.unstable_mockModule("json2csv", () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue("csv-data"),
  })),
}));

const eventService = await import("../../modules/event/event.service.js");
const eventController = await import("../../modules/event/event.controller.js");
const { Parser } = await import("json2csv");

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.attachment = jest.fn().mockReturnValue(res);
  return res;
};

let req, res, next;

describe("Event Controller", () => {
  beforeEach(() => {
    req = { params: {}, query: {}, body: {}, userId: 1 };
    res = createResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // listEvents
  describe("listEvents", () => {
    it("should return events", async () => {
      const mockEvents = [{ id: 1, title: "Event 1" }];
      eventService.getEvents.mockResolvedValue(mockEvents);

      await eventController.listEvents(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockEvents });
    });

    it("should call next on error", async () => {
      eventService.getEvents.mockRejectedValue(new Error("fail"));
      await eventController.listEvents(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // getEventDetails
  describe("getEventDetails", () => {
    it("should return event", async () => {
      const mockEvent = { id: 1, title: "Event 1" };
      req.params.eventId = 1;
      eventService.getEventById.mockResolvedValue(mockEvent);

      await eventController.getEventDetails(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ event: mockEvent });
    });
  });

  // purchaseTicket
  describe("purchaseTicket", () => {
    it("should purchase a ticket", async () => {
      const mockReg = { id: 1, qrCodeUrl: "/mock.png" };
      req.params.eventId = 1;
      req.body = { ticketId: 1, attendeeName: "A", attendeeEmail: "a@test.com", quantity: 2 };
      eventService.purchaseTicket.mockResolvedValue(mockReg);

      await eventController.purchaseTicket(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: mockReg });
    });
  });

  // getEventAttendees
  describe("getEventAttendees", () => {
    it("should return attendees as JSON", async () => {
      const mockAttendees = [{ full_name: "A B" }];
      req.params.eventId = 1;
      eventService.getEventAttendeesService.mockResolvedValue(mockAttendees);

      await eventController.getEventAttendees(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { attendees: mockAttendees } });
    });

    it("should return attendees as CSV", async () => {
      const mockAttendees = [{ full_name: "A B" }];
      req.params.eventId = 1;
      req.query.format = "csv";
      eventService.getEventAttendeesService.mockResolvedValue(mockAttendees);

      await eventController.getEventAttendees(req, res, next);

      expect(Parser).toHaveBeenCalled();
      expect(res.header).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.attachment).toHaveBeenCalledWith("event-1-attendees.csv");
      expect(res.send).toHaveBeenCalledWith("csv-data");
    });
  });

  // createEvent
  describe("createEvent", () => {
    it("should create an event", async () => {
      const mockEvent = { id: 1, title: "Test" };
      req.body = { title: "Test" };
      eventService.createEvent.mockResolvedValue(mockEvent);

      await eventController.createEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: mockEvent });
    });
  });
});
