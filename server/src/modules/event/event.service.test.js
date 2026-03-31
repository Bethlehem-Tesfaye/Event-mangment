import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  event: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  },
  ticket: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn()
  },
  user: { findUnique: vi.fn() },
  registration: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    groupBy: vi.fn()
  },
  notification: { create: vi.fn() },
  eventCategory: {
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn()
  },
  category: { findMany: vi.fn() },
  $transaction: vi.fn()
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));
vi.mock("qrcode", () => ({
  default: { toBuffer: vi.fn().mockResolvedValue(Buffer.from("qr")) }
}));
vi.mock("../../lib/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: vi
        .fn()
        .mockResolvedValue({ secure_url: "https://cdn.com/qr.png" })
    }
  }
}));
vi.mock("../../lib/socketio.js", () => ({ getConnection: vi.fn() }));
vi.mock("../../utils/qstashPublisher.js", () => ({
  publishEmailJob: vi.fn().mockResolvedValue(true),
  publishReminderJob: vi.fn().mockResolvedValue(true)
}));
vi.mock("../../utils/customError.js", async () => {
  const actual = await vi.importActual("../../utils/customError.js");
  return actual;
});

const {
  getEvents,
  getEventById,
  purchaseTicket,
  createEvent,
  getEventDetailById,
  updateEvent,
  deleteEvent,
  addCategoryToEvent,
  removeCategoryFromEvent,
  getEventAnalytics,
  getEventAttendeesService,
  getAllCategories,
  getOrganizerEvents,
  getUserRegistrations
} = await import("./event.service.js");

describe("getEvents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns events and totalCount", async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ id: "e1" }]);
    mockPrisma.event.count.mockResolvedValue(1);
    const result = await getEvents({ limit: 20, offset: 0 });
    expect(result.events).toHaveLength(1);
    expect(result.totalCount).toBe(1);
  });

  it("applies search filter", async () => {
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.event.count.mockResolvedValue(0);
    await getEvents({ search: "test" });
    const call = mockPrisma.event.findMany.mock.calls[0][0];
    expect(call.where.title).toEqual({
      contains: "test",
      mode: "insensitive"
    });
  });
});

describe("getEventById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns event when found", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: "e1" });
    const result = await getEventById("e1");
    expect(result.id).toBe("e1");
  });

  it("throws 404 when event not found", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(getEventById("bad")).rejects.toThrow("Event not found");
  });
});

describe("purchaseTicket", () => {
  const io = { to: vi.fn().mockReturnThis(), emit: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    io.to.mockReturnThis();
  });

  it("creates registration for authenticated user", async () => {
    const ticket = {
      id: 1,
      eventId: "e1",
      remainingQuantity: 10,
      price: 50
    };
    mockPrisma.ticket.findFirst.mockResolvedValue(ticket);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ email: "buyer@test.com" }) // buyer email lookup
      .mockResolvedValueOnce({
        email: "buyer@test.com",
        profile: { firstName: "John", lastName: "Doe" }
      }); // buyer name lookup
    mockPrisma.$transaction.mockImplementation(async (fn) =>
      fn({
        registration: {
          create: vi.fn().mockResolvedValue({ id: "r1" })
        },
        ticket: { update: vi.fn() }
      })
    );
    mockPrisma.registration.update.mockResolvedValue({});
    mockPrisma.event.findUnique
      .mockResolvedValueOnce({
        id: "e1",
        title: "Test Event",
        userId: "org1",
        startDatetime: new Date()
      })
      .mockResolvedValueOnce({
        id: "e1",
        title: "Test Event",
        userId: "org1"
      });
    mockPrisma.notification.create.mockResolvedValue({
      id: "n1",
      title: "Ticket Purchased",
      message: "msg",
      createdAt: new Date()
    });

    // ensure service uses our mocked socket connection
    const socketio = await import("../../lib/socketio.js");
    socketio.getConnection.mockReturnValue(io);
    const result = await purchaseTicket({
      eventId: "e1",
      ticketId: 1,
      userId: "u1",
      quantity: 1
    });
    expect(result.id).toBe("r1");
  });

  it("throws 404 when ticket not found", async () => {
    mockPrisma.ticket.findFirst.mockResolvedValue(null);
    await expect(
      purchaseTicket({ eventId: "e1", ticketId: 999, userId: "u1" })
    ).rejects.toThrow("Ticket not found");
  });

  it("throws 409 when not enough tickets", async () => {
    mockPrisma.ticket.findFirst.mockResolvedValue({
      id: 1,
      eventId: "e1",
      remainingQuantity: 0
    });
    await expect(
      purchaseTicket({ eventId: "e1", ticketId: 1, userId: "u1", quantity: 1 })
    ).rejects.toThrow("Not enough tickets available");
  });

  it("requires email for guest purchase", async () => {
    mockPrisma.ticket.findFirst.mockResolvedValue({
      id: 1,
      eventId: "e1",
      remainingQuantity: 10
    });
    await expect(
      purchaseTicket({ eventId: "e1", ticketId: 1, userId: null, quantity: 1 })
    ).rejects.toThrow("Email is required for ticket purchase");
  });
});

describe("createEvent", () => {
  const io = { to: vi.fn().mockReturnThis(), emit: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    io.to.mockReturnThis();
  });

  it("creates event and sends notification", async () => {
    mockPrisma.event.create.mockResolvedValue({ id: "e1", title: "Test" });
    mockPrisma.notification.create.mockResolvedValue({
      id: "n1",
      title: "Event Created",
      message: "msg",
      createdAt: new Date()
    });
    const socketio = await import("../../lib/socketio.js");
    socketio.getConnection.mockReturnValue(io);
    const result = await createEvent({ userId: "u1", title: "Test" });
    expect(result.id).toBe("e1");
    expect(io.to).toHaveBeenCalledWith("user:u1");
    expect(io.emit).toHaveBeenCalledWith(
      "notification:new",
      expect.objectContaining({ type: "event_created" })
    );
  });
});

describe("getEventDetailById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns event with includes", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: "e1" });
    const result = await getEventDetailById("e1");
    expect(result.id).toBe("e1");
  });

  it("throws 404 when not found", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);
    await expect(getEventDetailById("bad")).rejects.toThrow("Event not found");
  });
});

describe("updateEvent", () => {
  const io = { to: vi.fn().mockReturnThis(), emit: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    io.to.mockReturnThis();
  });

  it("updates event data", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "e1",
      userId: "u1",
      status: "draft"
    });
    mockPrisma.event.update.mockResolvedValue({ id: "e1", title: "Updated" });
    const socketio = await import("../../lib/socketio.js");
    socketio.getConnection.mockReturnValue(io);
    const result = await updateEvent("e1", "u1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("throws 404 when event not found", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(updateEvent("bad", "u1", { title: "x" })).rejects.toThrow(
      "Event not found"
    );
  });

  it("rejects invalid status transitions", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "e1",
      userId: "u1",
      status: "cancelled"
    });
    await expect(
      updateEvent("e1", "u1", { status: "published" })
    ).rejects.toThrow("Cannot change status");
  });

  it("validates required fields when publishing", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "e1",
      userId: "u1",
      status: "draft",
      title: "T",
      description: null
    });
    await expect(
      updateEvent("e1", "u1", { status: "published" })
    ).rejects.toThrow("Incomplete event data");
  });

  it("requires category and ticket when publishing", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "e1",
      userId: "u1",
      status: "draft",
      title: "T",
      description: "D",
      locationType: "online",
      startDatetime: new Date(),
      endDatetime: new Date(),
      duration: 60
    });
    mockPrisma.eventCategory.findFirst.mockResolvedValue(null);
    mockPrisma.ticket.findFirst.mockResolvedValue(null);
    await expect(
      updateEvent("e1", "u1", { status: "published" })
    ).rejects.toThrow("Event must have category and ticket to publish");
  });
});

describe("deleteEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("soft-deletes event", async () => {
    mockPrisma.event.update.mockResolvedValue({ id: "e1" });
    const result = await deleteEvent("e1");
    expect(result.id).toBe("e1");
    const call = mockPrisma.event.update.mock.calls[0][0];
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });
});

describe("addCategoryToEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates event-category association", async () => {
    mockPrisma.eventCategory.create.mockResolvedValue({ id: 1 });
    const result = await addCategoryToEvent({
      eventId: "e1",
      categoryId: "5"
    });
    expect(result.id).toBe(1);
    expect(mockPrisma.eventCategory.create).toHaveBeenCalledWith({
      data: { eventId: "e1", categoryId: 5 }
    });
  });
});

describe("removeCategoryFromEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("soft-deletes event-category association", async () => {
    mockPrisma.eventCategory.update.mockResolvedValue({ id: 1 });
    const result = await removeCategoryFromEvent({
      eventId: "e1",
      categoryId: "3"
    });
    expect(result.id).toBe(1);
  });
});

describe("getEventAnalytics", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 404 when event not found", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(getEventAnalytics("bad", "u1")).rejects.toThrow(
      "Event not found"
    );
  });

  it("throws 403 when user is not the organizer", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "e1",
      userId: "other"
    });
    await expect(getEventAnalytics("e1", "u1")).rejects.toThrow("Unauthorized");
  });

  it("returns analytics data", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "e1",
      userId: "u1"
    });
    mockPrisma.registration.groupBy.mockResolvedValue([
      { ticketType: 1, _sum: { registeredQuantity: 5 }, _count: { id: 5 } }
    ]);
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: 1,
      type: "VIP",
      price: "100"
    });
    const result = await getEventAnalytics("e1", "u1");
    expect(result.totalRevenue).toBe(500);
    expect(result.totalTicketsSold).toBe(5);
    expect(result.tickets).toHaveLength(1);
  });
});

describe("getEventAttendeesService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when no attendees", async () => {
    mockPrisma.registration.findMany.mockResolvedValue([]);
    const result = await getEventAttendeesService("e1");
    expect(result).toEqual([]);
  });

  it("returns formatted attendees", async () => {
    mockPrisma.registration.findMany.mockResolvedValue([
      {
        user: {
          email: "a@b.com",
          profile: { firstName: "John", lastName: "Doe" }
        },
        attendeeName: null,
        attendeeEmail: null,
        ticket: { type: "VIP" },
        registeredQuantity: 1,
        registeredAt: new Date("2025-01-01")
      }
    ]);
    const result = await getEventAttendeesService("e1");
    expect(result[0].full_name).toBe("John Doe");
    expect(result[0].email).toBe("a@b.com");
  });
});

describe("getAllCategories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns categories ordered by name", async () => {
    mockPrisma.category.findMany.mockResolvedValue([{ id: 1, name: "Art" }]);
    const result = await getAllCategories();
    expect(result).toHaveLength(1);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: "asc" }
    });
  });
});

describe("getOrganizerEvents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 when userId is missing", async () => {
    await expect(getOrganizerEvents(null)).rejects.toThrow(
      "User ID is required"
    );
  });

  it("returns events with attendees count", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      { id: "e1", _count: { registrations: 5 } }
    ]);
    mockPrisma.event.count.mockResolvedValue(1);
    const result = await getOrganizerEvents("u1");
    expect(result.events[0].attendeesCount).toBe(5);
    expect(result.totalCount).toBe(1);
  });
});

describe("getUserRegistrations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 when userId is missing", async () => {
    await expect(getUserRegistrations(null)).rejects.toThrow(
      "User ID is required"
    );
  });

  it("returns registrations", async () => {
    mockPrisma.registration.findMany.mockResolvedValue([{ id: "r1" }]);
    const result = await getUserRegistrations("u1");
    expect(result).toHaveLength(1);
  });
});
