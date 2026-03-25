import { describe, it, expect, vi, beforeEach } from "vitest";
import supertest from "supertest";
import { createTestApp } from "./setup.js";

vi.mock("../../src/middleware/authMiddleware.js", () => ({
  default: (req, _res, next) => {
    req.userId = "test-user";
    req.user = { id: "test-user" };
    next();
  }
}));

vi.mock("../../src/middleware/isEventOwner.js", () => ({
  default: (_req, _res, next) => next()
}));

vi.mock("../../src/modules/ticket/ticket.service.js", () => ({
  getTicketsForEvent: vi.fn().mockResolvedValue([{ id: 1 }]),
  createTicket: vi.fn().mockResolvedValue({ id: 1 }),
  updateTicket: vi.fn().mockResolvedValue({ id: 1 }),
  deleteTicket: vi.fn().mockResolvedValue({ id: 1 }),
  getUserTicketHistory: vi.fn().mockResolvedValue([])
}));

vi.mock("../../src/lib/prisma.js", () => ({
  default: {}
}));

const { ticketRoutes, userTicketRoutes } =
  await import("../../src/modules/ticket/ticket.routes.js");

describe("Organizer ticket routes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    // These routes expect eventId from mergeParams; we simulate it via path
    app = createTestApp("/events/e1", ticketRoutes);
  });

  it("GET /events/e1/tickets returns 200", async () => {
    const res = await supertest(app).get("/events/e1/tickets");
    expect(res.status).toBe(200);
  });

  it("POST /events/e1/tickets with valid body returns 201", async () => {
    const res = await supertest(app)
      .post("/events/e1/tickets")
      .send({ type: "VIP", price: 100, totalQuantity: 50 });
    expect(res.status).toBe(201);
  });

  it("POST /events/e1/tickets with invalid body returns 400", async () => {
    const res = await supertest(app)
      .post("/events/e1/tickets")
      .send({ price: -1 });
    expect(res.status).toBe(400);
  });

  it("DELETE /events/e1/tickets/:ticketId returns 200", async () => {
    const res = await supertest(app).delete("/events/e1/tickets/1");
    expect(res.status).toBe(200);
  });
});

describe("User ticket routes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp("/users/tickets", userTicketRoutes);
  });

  it("GET /users/tickets/tickets returns 200", async () => {
    const res = await supertest(app).get("/users/tickets/tickets");
    expect(res.status).toBe(200);
  });
});
