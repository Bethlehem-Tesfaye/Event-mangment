import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import prisma from "../../lib/prisma.js";
import * as eventService from "../../modules/event/event.service.js";

jest.setTimeout(20000);
// Mock prisma client
prisma.event = {
  create: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn()
};

prisma.ticket = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn()
};

prisma.eventSpeaker = {
  findMany: jest.fn()
};

prisma.eventCategory = {
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

prisma.registration = {
  findMany: jest.fn(),
  create: jest.fn().mockImplementation(async () => ({ id: 1 })),
  update: jest.fn(),
  groupBy: jest.fn()
};

prisma.$transaction = jest.fn().mockImplementation(async (cb) => cb(prisma));

describe("Event Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // createEvent
  describe("createEvent", () => {
    it("should create an event", async () => {
      const mockEvent = { id: 1, title: "Test Event" };
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await eventService.createEvent({
        userId: 10,
        title: "Test Event",
        description: "Desc",
        locationType: "online",
        location: "Zoom",
        startDatetime: new Date(),
        endDatetime: new Date(),
        duration: 60,
        eventBannerUrl: "url"
      });

      expect(result).toEqual(mockEvent);
    });
  });

  // getEventById
  describe("getEventById", () => {
    it("should return event if found", async () => {
      const mockEvent = { id: 1, title: "Sample Event" };
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      const result = await eventService.getEventById(1);

      expect(result).toEqual(mockEvent);
    });

    it("should throw CustomError if not found", async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      await expect(eventService.getEventById(1)).rejects.toThrow(
        "Event not found"
      );
    });
  });

  // getEvents
  describe("getEvents", () => {
    it("should return list of events", async () => {
      const mockEvents = [{ id: 1, title: "Event 1" }];
      prisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await eventService.getEvents({});
      expect(result).toEqual(mockEvents);
    });

    it("should throw CustomError if no events", async () => {
      prisma.event.findMany.mockResolvedValue([]);
      await expect(eventService.getEvents({})).rejects.toThrow(
        "No published events found"
      );
    });
  });

  // getEventSpeakers
  describe("getEventSpeakers", () => {
    it("should return speakers", async () => {
      const mockSpeakers = [{ id: 1, name: "Speaker 1" }];
      prisma.eventSpeaker.findMany.mockResolvedValue(mockSpeakers);

      const result = await eventService.getEventSpeakers(1);
      expect(result).toEqual(mockSpeakers);
    });

    it("should throw CustomError if no speakers", async () => {
      prisma.eventSpeaker.findMany.mockResolvedValue([]);
      await expect(eventService.getEventSpeakers(1)).rejects.toThrow(
        "No speakers found for this event"
      );
    });
  });

  // getEventTickets
  describe("getEventTickets", () => {
    it("should return tickets", async () => {
      const mockTickets = [{ id: 1, type: "VIP" }];
      prisma.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await eventService.getEventTickets(1);
      expect(result).toEqual(mockTickets);
    });

    it("should throw CustomError if no tickets", async () => {
      prisma.ticket.findMany.mockResolvedValue([]);
      await expect(eventService.getEventTickets(1)).rejects.toThrow(
        "No tickets found for this event"
      );
    });
  });

  // getEventDetailById
  describe("getEventDetailById", () => {
    it("should return event detail", async () => {
      const mockEvent = { id: 1, title: "Event Detail" };
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await eventService.getEventDetailById(1);
      expect(result).toEqual(mockEvent);
    });

    it("should throw CustomError if not found", async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(eventService.getEventDetailById(1)).rejects.toThrow(
        "Event not found"
      );
    });
  });

  // addCategoryToEvent
  describe("addCategoryToEvent", () => {
    it("should add category", async () => {
      const mockCat = { eventId: 1, categoryId: 2 };
      prisma.eventCategory.create.mockResolvedValue(mockCat);

      const result = await eventService.addCategoryToEvent({
        eventId: 1,
        categoryId: 2
      });
      expect(result).toEqual(mockCat);
    });
  });

  // removeCategoryFromEvent
  describe("removeCategoryFromEvent", () => {
    it("should soft delete category", async () => {
      const mockCat = { eventId: 1, categoryId: 2, deletedAt: new Date() };
      prisma.eventCategory.update.mockResolvedValue(mockCat);

      const result = await eventService.removeCategoryFromEvent({
        eventId: 1,
        categoryId: 2
      });
      expect(result).toEqual(mockCat);
    });
  });

  // getEventAnalytics
  describe("getEventAnalytics", () => {
    it("should return analytics", async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 1,
        userId: 10,
        deletedAt: null
      });
      prisma.registration.groupBy.mockResolvedValue([
        { ticketType: 1, _sum: { registeredQuantity: 2 }, _count: { id: 1 } }
      ]);
      prisma.ticket.findUnique.mockResolvedValue({
        id: 1,
        type: "VIP",
        price: 50
      });

      const result = await eventService.getEventAnalytics(1, 10);
      expect(result.totalRevenue).toBe(100);
      expect(result.totalTicketsSold).toBe(2);
    });
  });

  // getEventAttendeesService
  describe("getEventAttendeesService", () => {
    it("should return attendees", async () => {
      const mockRegs = [
        {
          registeredQuantity: 1,
          registeredAt: new Date(),
          ticket: { type: "VIP" },
          user: {
            email: "a@test.com",
            profile: { firstName: "A", lastName: "B" }
          },
          attendeeName: "N/A",
          attendeeEmail: "N/A"
        }
      ];
      prisma.registration.findMany.mockResolvedValue(mockRegs);

      const result = await eventService.getEventAttendeesService(1);
      expect(result[0].full_name).toBe("A B");
    });

    it("should throw CustomError if no attendees", async () => {
      prisma.registration.findMany.mockResolvedValue([]);
      await expect(eventService.getEventAttendeesService(1)).rejects.toThrow(
        "No attendees found"
      );
    });
  });
});
