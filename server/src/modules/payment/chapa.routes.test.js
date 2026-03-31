import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  ticket: { findUnique: vi.fn() },
  organizerSettings: { findUnique: vi.fn() },
  payment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  registration: { findFirst: vi.fn() }
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}));
vi.mock("../event/event.service.js", () => ({
  purchaseTicket: vi.fn()
}));

vi.mock("../../middleware/authMiddleware.js", () => ({
  default: (req, res, next) => {
    req.userId = req.headers["x-test-user-id"] || "test-user";
    next();
  }
}));

vi.mock("../../utils/logger.js", () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}));

const axios = (await import("axios")).default;
const { purchaseTicket } = await import("../event/event.service.js");

// Import the router and test with supertest
const { chapaRoutes } = await import("./chapa.routes.js");

// Build a minimal Express app for testing
const express = (await import("express")).default;
const { default: supertest } = await import("supertest");

function createApp() {
  const app = express();
  app.use(express.json());
  app.set("io", { to: vi.fn().mockReturnThis(), emit: vi.fn() });
  app.use("/chapa", chapaRoutes);
  return app;
}

describe("POST /chapa/initialize", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it("returns 404 when ticket not found", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(null);
    const res = await supertest(app)
      .post("/chapa/initialize")
      .send({ ticketId: 999, eventId: "e1" });
    expect(res.status).toBe(404);
  });

  it("returns 400 when organizer has no Chapa key", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: 1,
      price: 100,
      event: { userId: "org1" }
    });
    mockPrisma.organizerSettings.findUnique.mockResolvedValue(null);
    const res = await supertest(app)
      .post("/chapa/initialize")
      .send({ ticketId: 1, eventId: "e1", email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("initializes payment and returns checkout URL", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: 1,
      price: 100,
      event: { userId: "org1" }
    });
    mockPrisma.organizerSettings.findUnique.mockResolvedValue({
      chapaKey: "CHASECK_TEST-xxx"
    });
    mockPrisma.payment.create.mockResolvedValue({
      id: "pay1",
      status: "pending"
    });
    axios.post.mockResolvedValue({
      status: 200,
      data: { data: { checkout_url: "https://checkout.chapa.co/pay/abc" } }
    });

    const res = await supertest(app).post("/chapa/initialize").send({
      ticketId: 1,
      eventId: "e1",
      quantity: 1,
      email: "a@b.com",
      firstName: "John",
      lastName: "Doe"
    });
    expect(res.status).toBe(200);
    expect(res.body.checkoutUrl).toBe("https://checkout.chapa.co/pay/abc");
    expect(res.body.paymentId).toBe("pay1");
  });

  it("returns error when Chapa API fails", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: 1,
      price: 100,
      event: { userId: "org1" }
    });
    mockPrisma.organizerSettings.findUnique.mockResolvedValue({
      chapaKey: "CHASECK_TEST-xxx"
    });
    mockPrisma.payment.create.mockResolvedValue({ id: "pay1" });
    axios.post.mockRejectedValue({
      message: "Chapa error",
      response: { status: 400, data: { message: "Invalid" } }
    });

    const res = await supertest(app).post("/chapa/initialize").send({
      ticketId: 1,
      eventId: "e1",
      email: "a@b.com"
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /chapa/webhook", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
    process.env.CHAPA_WEBHOOK_SECRET = "test-secret";
  });

  it("returns 403 on invalid signature", async () => {
    const res = await supertest(app)
      .post("/chapa/webhook")
      .set("x-chapa-signature", "bad-sig")
      .send({ tx_ref: "ref1", status: "success" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when tx_ref is missing", async () => {
    const res = await supertest(app)
      .post("/chapa/webhook")
      .set("x-chapa-signature", "test-secret")
      .send({ status: "success" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when payment not found", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    const res = await supertest(app)
      .post("/chapa/webhook")
      .set("x-chapa-signature", "test-secret")
      .send({ tx_ref: "unknown", status: "success" });
    expect(res.status).toBe(404);
  });

  it("returns 200 when payment already processed", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay1",
      status: "success",
      txRef: "ref1"
    });
    const res = await supertest(app)
      .post("/chapa/webhook")
      .set("x-chapa-signature", "test-secret")
      .send({ tx_ref: "ref1", status: "success" });
    expect(res.status).toBe(200);
    expect(res.text).toContain("Already processed");
  });

  it("processes successful payment and issues tickets", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay1",
      status: "pending",
      eventId: "e1",
      ticketId: 1,
      userId: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "a@b.com",
      quantity: 1
    });
    mockPrisma.payment.update.mockResolvedValue({
      id: "pay1",
      status: "success",
      txRef: "ref1",
      chapaRefId: "chapa-ref",
      eventId: "e1",
      ticketId: 1,
      userId: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "a@b.com",
      quantity: 1
    });
    purchaseTicket.mockResolvedValue({});

    const res = await supertest(app)
      .post("/chapa/webhook")
      .set("x-chapa-signature", "test-secret")
      .send({ tx_ref: "ref1", status: "success", reference: "chapa-ref" });
    expect(res.status).toBe(200);
    expect(purchaseTicket).toHaveBeenCalled();
  });
});

describe("GET /chapa/callback", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLIENT_URL = "https://example.com";
    app = createApp();
  });

  it("redirects to client when no reference", async () => {
    const res = await supertest(app).get("/chapa/result");
    expect(res.status).toBe(400);
  });

  it("redirects when payment not found", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    const res = await supertest(app).get("/chapa/result?tx_ref=bad");
    expect(res.status).toBe(404);
  });

  it("issues tickets on successful callback", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay1",
      status: "pending",
      eventId: "e1",
      ticketId: 1,
      userId: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "a@b.com",
      quantity: 1
    });
    mockPrisma.payment.update.mockResolvedValue({});
    purchaseTicket.mockResolvedValue({});

    // provide organizer settings and chapa verify response
    mockPrisma.organizerSettings.findUnique.mockResolvedValue({
      chapaKey: "CHASECK_TEST-xxx"
    });
    // const axios = (await import("axios")).default;
    axios.get.mockResolvedValue({
      data: { data: { status: "success", ref_id: "chapa-ref" } }
    });

    mockPrisma.registration.findFirst.mockResolvedValue({ id: "reg1" });
    const res = await supertest(app).get(
      "/chapa/result?tx_ref=ref1&status=success&ref_id=chapa-ref"
    );
    expect(res.status).toBe(200);
    expect(purchaseTicket).toHaveBeenCalled();
  });
});
