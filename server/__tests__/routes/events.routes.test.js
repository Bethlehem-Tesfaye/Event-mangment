import { describe, it, expect, vi, beforeEach } from "vitest";
// Ensure `createAuthEndpoint` (and other plugins) exist in test env
vi.mock("better-auth/plugins", () => ({
  createAuthEndpoint: (path, method, handler) => handler,
  openAPI: () => () => {},
  anonymous: () => () => {}
}));
import supertest from "supertest";
import { createTestApp } from "./setup.js";

// Mock auth middleware to pass through
vi.mock("../../src/middleware/authMiddleware.js", () => ({
  default: (req, _res, next) => {
    req.userId = "test-user";
    req.user = { id: "test-user", email: "test@test.com" };
    next();
  }
}));

vi.mock("../../src/middleware/optionalAuthMiddleware.js", () => ({
  default: (req, _res, next) => {
    req.userId = null;
    req.user = null;
    next();
  }
}));

vi.mock("../../src/middleware/isEventOwner.js", () => ({
  default: (_req, _res, next) => next()
}));

vi.mock("../../src/middleware/requireRealUserMiddleware.js", () => ({
  default: (_req, _res, next) => next()
}));

vi.mock("../../src/middleware/upload.js", () => ({
  eventBannerUpload: {
    single: () => (_req, _res, next) => next()
  },
  profileUpload: {
    single: () => (_req, _res, next) => next()
  }
}));

// Mock services
vi.mock("../../src/modules/event/event.service.js", () => ({
  getEvents: vi.fn().mockResolvedValue({ events: [], totalCount: 0 }),
  getEventById: vi.fn().mockResolvedValue({ id: "e1", title: "Test" }),
  purchaseTicket: vi.fn().mockResolvedValue({ id: "r1" }),
  createEvent: vi.fn().mockResolvedValue({ id: "e1" }),
  getEventDetailById: vi.fn().mockResolvedValue({ id: "e1" }),
  updateEvent: vi.fn().mockResolvedValue({ id: "e1" }),
  deleteEvent: vi.fn().mockResolvedValue({ id: "e1" }),
  addCategoryToEvent: vi.fn().mockResolvedValue({ id: 1 }),
  removeCategoryFromEvent: vi.fn().mockResolvedValue({ id: 1 }),
  getEventAttendeesService: vi.fn().mockResolvedValue([]),
  getEventAnalytics: vi.fn().mockResolvedValue({ totalRevenue: 0 }),
  getAllCategories: vi.fn().mockResolvedValue([]),
  getOrganizerEvents: vi.fn().mockResolvedValue({ events: [], totalCount: 0 }),
  getDashboardStatsService: vi
    .fn()
    .mockResolvedValue({ totalEvents: 0, totalRevenue: 0 }),
  getUserRegistrations: vi.fn().mockResolvedValue([])
}));

vi.mock("../../src/modules/ticket/ticket.service.js", () => ({
  getTicketsForEvent: vi.fn().mockResolvedValue([]),
  createTicket: vi.fn().mockResolvedValue({ id: 1 }),
  updateTicket: vi.fn().mockResolvedValue({ id: 1 }),
  deleteTicket: vi.fn().mockResolvedValue({ id: 1 }),
  getUserTicketHistory: vi.fn().mockResolvedValue([])
}));

vi.mock("../../src/modules/speaker/speaker.service.js", () => ({
  getSpeakersForEvent: vi.fn().mockResolvedValue([]),
  createSpeaker: vi.fn().mockResolvedValue({ id: 1 }),
  updateSpeaker: vi.fn().mockResolvedValue({ id: 1 }),
  deleteSpeaker: vi.fn().mockResolvedValue({ id: 1 })
}));

vi.mock("../../src/lib/prisma.js", () => ({
  default: {}
}));

const { eventRoutes, organizerRoutes } =
  await import("../../src/modules/event/event.route.js");

describe("Public event routes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp("/events", eventRoutes);
  });

  it("GET /events returns 200", async () => {
    const res = await supertest(app).get("/events");
    expect(res.status).toBe(200);
  });

  it("GET /events/categories returns 200", async () => {
    const res = await supertest(app).get("/events/categories");
    expect(res.status).toBe(200);
  });

  it("GET /events/:eventId returns 200", async () => {
    const res = await supertest(app).get("/events/test-event-id");
    expect(res.status).toBe(200);
  });

  it("POST /events/:eventId/tickets/purchase returns 201", async () => {
    const res = await supertest(app)
      .post("/events/e1/tickets/purchase")
      .send({ ticketId: "1", quantity: "1", attendeeEmail: "a@b.com" });
    expect(res.status).toBe(201);
  });
});

describe("Organizer event routes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp("/organizer/events", organizerRoutes);
  });

  it("GET /organizer/events returns 200", async () => {
    const res = await supertest(app).get("/organizer/events");
    expect(res.status).toBe(200);
  });

  it("GET /organizer/events/stats returns 200", async () => {
    const res = await supertest(app).get("/organizer/events/stats");
    expect(res.status).toBe(200);
  });

  it("POST /organizer/events creates event (validation: needs title)", async () => {
    const res = await supertest(app)
      .post("/organizer/events")
      .send({ title: "Test Event" });
    expect(res.status).toBe(201);
  });

  it("POST /organizer/events with invalid body returns 400", async () => {
    const res = await supertest(app).post("/organizer/events").send({});
    expect(res.status).toBe(400);
  });

  it("GET /organizer/events/:eventId returns 200", async () => {
    const res = await supertest(app).get("/organizer/events/e1");
    expect(res.status).toBe(200);
  });

  it("DELETE /organizer/events/:eventId returns 200", async () => {
    const res = await supertest(app).delete("/organizer/events/e1");
    expect(res.status).toBe(200);
  });
});
