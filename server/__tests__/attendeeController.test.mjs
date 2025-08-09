import { jest, test, expect, describe, beforeEach } from "@jest/globals";
import {
  eventRegister,
  viewMyTickets,
  cancelRegistration,
  getEventAttendees
} from "../controllers/attendeeController.js";
import prisma from "../lib/prisma.js";
import CustomError from "../utils/customError.js";

jest.mock("../lib/prisma.js");

prisma.ticket = {
  findFirst: jest.fn(),
  update: jest.fn()
};
prisma.registration = {
  aggregate: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn()
};
prisma.$transaction = jest.fn();

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("attendeeController", () => {
  let req, res, next;

  beforeEach(() => {
    res = createRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  // eventRegister
  describe("eventRegister", () => {
    it("should register successfully", async () => {
      prisma.ticket.findFirst.mockResolvedValue({
        id: 1,
        remainingQuantity: 10,
        maxPerUser: 5
      });
      prisma.registration.aggregate.mockResolvedValue({
        _sum: { registeredQuantity: 0 }
      });
      const newRegistration = { id: 1 };
      prisma.$transaction.mockResolvedValue([{}, newRegistration]);

      req = {
        userId: 1,
        params: { ticketId: "1", id: "2" },
        body: { registeredQuantity: 2 }
      };

      await eventRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { registration: newRegistration }
      });
    });

    it("should return 404 if ticket not found", async () => {
      prisma.ticket.findFirst.mockResolvedValue(null);
      req = {
        userId: 1,
        params: { ticketId: "1", id: "2" },
        body: { registeredQuantity: 2 }
      };
      await eventRegister(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should return 400 if not enough tickets", async () => {
      prisma.ticket.findFirst.mockResolvedValue({
        remainingQuantity: 1,
        maxPerUser: 5
      });
      req = {
        userId: 1,
        params: { ticketId: "1", id: "2" },
        body: { registeredQuantity: 5 }
      };
      await eventRegister(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should return 400 if max per user exceeded", async () => {
      prisma.ticket.findFirst.mockResolvedValue({
        id: 1,
        remainingQuantity: 10,
        maxPerUser: 5
      });
      prisma.registration.aggregate.mockResolvedValue({
        _sum: { registeredQuantity: 4 }
      });
      req = {
        userId: 1,
        params: { ticketId: "1", id: "2" },
        body: { registeredQuantity: 2 }
      };
      await eventRegister(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should handle prisma error", async () => {
      const error = new Error("DB error");
      prisma.ticket.findFirst.mockRejectedValue(error);
      req = {
        userId: 1,
        params: { ticketId: "1", id: "2" },
        body: { registeredQuantity: 2 }
      };
      await eventRegister(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // viewMyTickets
  describe("viewMyTickets", () => {
    it("should return tickets if found", async () => {
      prisma.registration.findMany.mockResolvedValue([{ id: 1 }]);
      req = { userId: 1 };
      await viewMyTickets(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if none", async () => {
      prisma.registration.findMany.mockResolvedValue([]);
      req = { userId: 1 };
      await viewMyTickets(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should handle prisma error", async () => {
      const error = new Error("DB error");
      prisma.registration.findMany.mockRejectedValue(error);
      req = { userId: 1 };
      await viewMyTickets(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // cancelRegistration
  describe("cancelRegistration", () => {
    it("should cancel if authorized and before start", async () => {
      prisma.registration.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        registeredQuantity: 2,
        ticket: {
          id: 1,
          event: { startDatetime: new Date(Date.now() + 10000) }
        }
      });
      prisma.$transaction.mockResolvedValue([{}, {}]);
      req = { userId: 1, params: { registrationId: "1" } };
      await cancelRegistration(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if registration not found", async () => {
      prisma.registration.findFirst.mockResolvedValue(null);
      req = { userId: 1, params: { registrationId: "1" } };
      await cancelRegistration(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should return 403 if unauthorized", async () => {
      prisma.registration.findFirst.mockResolvedValue({
        id: 1,
        userId: 2,
        ticket: { event: { startDatetime: new Date(Date.now() + 10000) } }
      });
      req = { userId: 1, params: { registrationId: "1" } };
      await cancelRegistration(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should return 400 if event already started", async () => {
      prisma.registration.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        ticket: { event: { startDatetime: new Date(Date.now() - 10000) } }
      });
      req = { userId: 1, params: { registrationId: "1" } };
      await cancelRegistration(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should handle prisma error", async () => {
      const error = new Error("DB error");
      prisma.registration.findFirst.mockRejectedValue(error);
      req = { userId: 1, params: { registrationId: "1" } };
      await cancelRegistration(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getEventAttendees
  describe("getEventAttendees", () => {
    it("should return attendees if found", async () => {
      prisma.registration.findMany.mockResolvedValue([
        {
          registeredQuantity: 2,
          registeredAt: new Date(),
          ticket: { type: "VIP" },
          user: {
            email: "a@test.com",
            profile: { firstName: "A", lastName: "B" }
          }
        }
      ]);
      req = { params: { id: "1" } };
      await getEventAttendees(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if none", async () => {
      prisma.registration.findMany.mockResolvedValue([]);
      req = { params: { id: "1" } };
      await getEventAttendees(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    });

    it("should handle prisma error", async () => {
      const error = new Error("DB error");
      prisma.registration.findMany.mockRejectedValue(error);
      req = { params: { id: "1" } };
      await getEventAttendees(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
