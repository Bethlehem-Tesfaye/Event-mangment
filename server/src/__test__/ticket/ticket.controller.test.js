import { jest, describe, it, expect, afterEach } from "@jest/globals";

// Mock ticket service
jest.unstable_mockModule("../../modules/ticket/ticket.service.js", () => ({
  createTicket: jest.fn(),
  getTicketsForEvent: jest.fn(),
  updateTicket: jest.fn(),
  deleteTicket: jest.fn(),
  getUserTicketHistory: jest.fn()
}));

const ticketService = await import("../../modules/ticket/ticket.service.js");
const ticketController = await import(
  "../../modules/ticket/ticket.controller.js"
);

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe("ticketController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTicket", () => {
    it("calls service and returns 201", async () => {
      const req = { params: { eventId: "1" }, body: { title: "VIP" } };
      const res = createResponse();

      ticketService.createTicket.mockResolvedValue({ id: 1, title: "VIP" });

      await ticketController.createTicket(req, res, next);

      expect(ticketService.createTicket).toHaveBeenCalledWith({
        eventId: "1",
        title: "VIP"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: { id: 1, title: "VIP" }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next on service error", async () => {
      const req = { params: { eventId: "1" }, body: {} };
      const res = createResponse();
      const error = new Error("fail");
      ticketService.createTicket.mockRejectedValue(error);

      await ticketController.createTicket(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getTicketsForEvent", () => {
    it("calls service and returns 200", async () => {
      const req = { params: { eventId: "1" } };
      const res = createResponse();

      ticketService.getTicketsForEvent.mockResolvedValue([{ id: 1 }]);

      await ticketController.getTicketsForEvent(req, res, next);

      expect(ticketService.getTicketsForEvent).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getPublicTicketsForEvent", () => {
    it("calls service and returns 200", async () => {
      const req = { params: { eventId: "1" } };
      const res = createResponse();

      ticketService.getTicketsForEvent.mockResolvedValue([{ id: 1 }]);

      await ticketController.getPublicTicketsForEvent(req, res, next);

      expect(ticketService.getTicketsForEvent).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateTicket", () => {
    it("calls service and returns 200", async () => {
      const req = { params: { ticketId: "1" }, body: { title: "Updated" } };
      const res = createResponse();

      ticketService.updateTicket.mockResolvedValue({ id: 1, title: "Updated" });

      await ticketController.updateTicket(req, res, next);

      expect(ticketService.updateTicket).toHaveBeenCalledWith("1", {
        title: "Updated"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { id: 1, title: "Updated" }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("deleteTicket", () => {
    it("calls service and returns 200", async () => {
      const req = { params: { ticketId: "1" } };
      const res = createResponse();

      ticketService.deleteTicket.mockResolvedValue({ id: 1 });

      await ticketController.deleteTicket(req, res, next);

      expect(ticketService.deleteTicket).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { id: 1 } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getUserTicketHistory", () => {
    it("calls service and returns 200", async () => {
      const req = { userId: "123" };
      const res = createResponse();

      ticketService.getUserTicketHistory.mockResolvedValue([{ id: 1 }]);

      await ticketController.getUserTicketHistory(req, res, next);

      expect(ticketService.getUserTicketHistory).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
