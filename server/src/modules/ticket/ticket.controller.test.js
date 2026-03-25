import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockReq } from "../../../__tests__/helpers/createMockReq.js";
import { createMockRes } from "../../../__tests__/helpers/createMockRes.js";

vi.mock("./ticket.service.js", () => ({
  createTicket: vi.fn(),
  getTicketsForEvent: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
  getUserTicketHistory: vi.fn()
}));

const ticketService = await import("./ticket.service.js");
const {
  createTicket,
  getTicketsForEvent,
  getPublicTicketsForEvent,
  updateTicket,
  deleteTicket,
  getUserTicketHistory
} = await import("./ticket.controller.js");

describe("createTicket controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with created ticket", async () => {
    const ticket = { id: 1, type: "VIP" };
    ticketService.createTicket.mockResolvedValue(ticket);
    const req = createMockReq({
      params: { eventId: "e1" },
      body: { type: "VIP", price: 50, totalQuantity: 100 }
    });
    const res = createMockRes();
    const next = vi.fn();
    await createTicket(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: ticket });
    expect(ticketService.createTicket).toHaveBeenCalledWith({
      eventId: "e1",
      type: "VIP",
      price: 50,
      totalQuantity: 100
    });
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    ticketService.createTicket.mockRejectedValue(err);
    const req = createMockReq({ params: { eventId: "e1" }, body: {} });
    const res = createMockRes();
    const next = vi.fn();
    await createTicket(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("getTicketsForEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with tickets", async () => {
    const tickets = [{ id: 1 }];
    ticketService.getTicketsForEvent.mockResolvedValue(tickets);
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await getTicketsForEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: tickets });
  });
});

describe("getPublicTicketsForEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with tickets", async () => {
    const tickets = [{ id: 1 }];
    ticketService.getTicketsForEvent.mockResolvedValue(tickets);
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await getPublicTicketsForEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: tickets });
  });
});

describe("updateTicket controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with updated ticket", async () => {
    const updated = { id: 1, price: 75 };
    ticketService.updateTicket.mockResolvedValue(updated);
    const req = createMockReq({
      params: { ticketId: "1" },
      body: { price: 75 }
    });
    const res = createMockRes();
    const next = vi.fn();
    await updateTicket(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(ticketService.updateTicket).toHaveBeenCalledWith("1", { price: 75 });
  });
});

describe("deleteTicket controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with deleted ticket", async () => {
    const deleted = { id: 1 };
    ticketService.deleteTicket.mockResolvedValue(deleted);
    const req = createMockReq({ params: { ticketId: "1" } });
    const res = createMockRes();
    const next = vi.fn();
    await deleteTicket(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(ticketService.deleteTicket).toHaveBeenCalledWith("1");
  });
});

describe("getUserTicketHistory controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with history", async () => {
    const history = [{ id: "r1" }];
    ticketService.getUserTicketHistory.mockResolvedValue(history);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getUserTicketHistory(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: history });
  });
});
