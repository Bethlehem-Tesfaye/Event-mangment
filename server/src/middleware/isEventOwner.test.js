import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  event: { findFirst: vi.fn() }
};

vi.mock("../lib/prisma.js", () => ({ default: mockPrisma }));
vi.mock("../utils/customError.js", async () => {
  const actual = await vi.importActual("../utils/customError.js");
  return actual;
});

const { default: isEventOwner } = await import("./isEventOwner.js");

describe("isEventOwner", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: { eventId: "evt-1" }, userId: "user-1" };
    res = {};
    next = vi.fn();
  });

  it("calls next() when user owns the event", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: "evt-1" });
    await isEventOwner(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("passes 401 CustomError when userId is missing", async () => {
    req.userId = null;
    await isEventOwner(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it("passes 400 CustomError when eventId is missing", async () => {
    req.params.eventId = undefined;
    await isEventOwner(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
  });

  it("passes 403 CustomError when event not found for user", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await isEventOwner(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  it("forwards database errors via next()", async () => {
    const dbErr = new Error("DB error");
    mockPrisma.event.findFirst.mockRejectedValue(dbErr);
    await isEventOwner(req, res, next);
    expect(next).toHaveBeenCalledWith(dbErr);
  });
});
