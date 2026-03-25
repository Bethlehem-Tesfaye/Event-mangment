import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockReq } from "../../../__tests__/helpers/createMockReq.js";
import { createMockRes } from "../../../__tests__/helpers/createMockRes.js";

vi.mock("./notification.server.js", () => ({
  getNotification: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn()
}));

const notifService = await import("./notification.server.js");
const { getNotification, markAsRead, markAllAsRead } = await import(
  "./notification.controller.js"
);

describe("getNotification controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with notifications", async () => {
    const notifs = [{ id: "n1" }];
    notifService.getNotification.mockResolvedValue(notifs);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getNotification(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: notifs });
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    notifService.getNotification.mockRejectedValue(err);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getNotification(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("markAsRead controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 on success", async () => {
    notifService.markAsRead.mockResolvedValue({});
    const req = createMockReq({ params: { id: "n1" } });
    const res = createMockRes();
    const next = vi.fn();
    await markAsRead(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(notifService.markAsRead).toHaveBeenCalledWith("n1");
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    notifService.markAsRead.mockRejectedValue(err);
    const req = createMockReq({ params: { id: "n1" } });
    const res = createMockRes();
    const next = vi.fn();
    await markAsRead(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("markAllAsRead controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 on success", async () => {
    notifService.markAllAsRead.mockResolvedValue({ count: 3 });
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await markAllAsRead(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(notifService.markAllAsRead).toHaveBeenCalledWith("u1");
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    notifService.markAllAsRead.mockRejectedValue(err);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await markAllAsRead(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
