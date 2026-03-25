import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  ticket: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn()
  },
  registration: {
    findMany: vi.fn()
  }
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));

const {
  createTicket,
  getTicketsForEvent,
  updateTicket,
  deleteTicket,
  getUserTicketHistory
} = await import("./ticket.service.js");

describe("createTicket", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates ticket with remainingQuantity equal to totalQuantity", async () => {
    const ticket = { id: 1, eventId: "e1", type: "VIP", price: 50 };
    mockPrisma.ticket.create.mockResolvedValue(ticket);
    const result = await createTicket({
      eventId: "e1",
      type: "VIP",
      price: 50,
      totalQuantity: 100,
      maxPerUser: 5
    });
    expect(result).toEqual(ticket);
    expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
      data: {
        eventId: "e1",
        type: "VIP",
        price: 50,
        totalQuantity: 100,
        remainingQuantity: 100,
        maxPerUser: 5
      }
    });
  });
});

describe("getTicketsForEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns tickets for event", async () => {
    const tickets = [{ id: 1, type: "VIP" }];
    mockPrisma.ticket.findMany.mockResolvedValue(tickets);
    const result = await getTicketsForEvent("e1");
    expect(result).toEqual(tickets);
    expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
      where: { eventId: "e1", deletedAt: null }
    });
  });

  it("throws 404 when no tickets found", async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([]);
    await expect(getTicketsForEvent("e1")).rejects.toThrow(
      "No tickets found for this event"
    );
  });
});

describe("updateTicket", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates ticket and sets updatedAt", async () => {
    const updated = { id: 1, price: 75 };
    mockPrisma.ticket.update.mockResolvedValue(updated);
    const result = await updateTicket("1", { price: 75 });
    expect(result).toEqual(updated);
    const call = mockPrisma.ticket.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.data.price).toBe(75);
    expect(call.data.updatedAt).toBeInstanceOf(Date);
  });
});

describe("deleteTicket", () => {
  beforeEach(() => vi.clearAllMocks());

  it("soft-deletes ticket", async () => {
    mockPrisma.ticket.update.mockResolvedValue({ id: 1 });
    const result = await deleteTicket("1");
    expect(result).toEqual({ id: 1 });
    const call = mockPrisma.ticket.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });
});

describe("getUserTicketHistory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns user registrations ordered by registeredAt desc", async () => {
    const regs = [{ id: "r1" }];
    mockPrisma.registration.findMany.mockResolvedValue(regs);
    const result = await getUserTicketHistory("u1");
    expect(result).toEqual(regs);
    expect(mockPrisma.registration.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", deletedAt: null },
      include: { event: true, ticket: true },
      orderBy: { registeredAt: "desc" }
    });
  });
});
