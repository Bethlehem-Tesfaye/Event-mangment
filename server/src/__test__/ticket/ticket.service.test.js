import { jest, describe, it, beforeEach, afterEach, expect } from "@jest/globals";

jest.unstable_mockModule("../../lib/prisma.js", () => ({
  default: {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    registration: {
      findMany: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../utils/customError.js", () => ({
  default: class CustomError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  },
}));
const prismaModule = await import("../../lib/prisma.js");
const CustomErrorModule = await import("../../utils/customError.js");
const ticketService = await import("../../modules/ticket/ticket.service.js");

const prisma = prismaModule.default;
const CustomError = CustomErrorModule.default;

describe("Ticket Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // createTicket
  describe("createTicket", () => {
    it("should create a ticket", async () => {
      const input = { eventId: 1, type: "VIP", price: 100, totalQuantity: 50, maxPerUser: 5 };
      const mockTicket = { id: 1, ...input, remainingQuantity: 50 };
      prisma.ticket.create.mockResolvedValue(mockTicket);

      const result = await ticketService.createTicket(input);

      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: { ...input, eventId: 1, remainingQuantity: 50 },
      });
      expect(result).toEqual(mockTicket);
    });
  });

  // getTicketsForEvent
  describe("getTicketsForEvent", () => {
    it("should return tickets if found", async () => {
      const mockTickets = [{ id: 1 }, { id: 2 }];
      prisma.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await ticketService.getTicketsForEvent(1);

      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { eventId: 1, deletedAt: null },
      });
      expect(result).toEqual(mockTickets);
    });

    it("should throw CustomError if no tickets found", async () => {
      prisma.ticket.findMany.mockResolvedValue([]);

      await expect(ticketService.getTicketsForEvent(1)).rejects.toThrow(CustomError);
      await expect(ticketService.getTicketsForEvent(1)).rejects.toMatchObject({
        message: "No tickets found for this event",
        status: 404,
      });
    });
  });

  // updateTicket
  describe("updateTicket", () => {
    it("should update a ticket", async () => {
      const mockTicket = { id: 1, type: "VIP" };
      prisma.ticket.update.mockResolvedValue(mockTicket);

      const result = await ticketService.updateTicket(1, { type: "VIP" });

      expect(prisma.ticket.update).toHaveBeenCalled();
      expect(result).toEqual(mockTicket);
    });
  });

  // deleteTicket (soft delete)
  describe("deleteTicket", () => {
    it("should soft delete a ticket", async () => {
      const mockTicket = { id: 1, deletedAt: new Date() };
      prisma.ticket.update.mockResolvedValue(mockTicket);

      const result = await ticketService.deleteTicket(1);

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockTicket);
    });
  });

  // getUserTicketHistory
 
  describe("getUserTicketHistory", () => {
    it("should return registration history", async () => {
      const mockRegistrations = [
        { id: 1, event: {}, ticket: {}, registeredAt: new Date() },
      ];
      prisma.registration.findMany.mockResolvedValue(mockRegistrations);

      const result = await ticketService.getUserTicketHistory(1);

      expect(prisma.registration.findMany).toHaveBeenCalledWith({
        where: { userId: 1, deletedAt: null },
        include: { event: true, ticket: true },
        orderBy: { registeredAt: "desc" },
      });
      expect(result).toEqual(mockRegistrations);
    });
  });
});
