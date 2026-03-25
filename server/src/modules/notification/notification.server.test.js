import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  notification: {
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn()
  }
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));

const { getNotification, markAsRead, markAllAsRead } =
  await import("./notification.server.js");

describe("getNotification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns notifications for user ordered by createdAt desc", async () => {
    const notifs = [{ id: "n1" }, { id: "n2" }];
    mockPrisma.notification.findMany.mockResolvedValue(notifs);
    const result = await getNotification("u1");
    expect(result).toEqual(notifs);
    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: { createdAt: "desc" }
    });
  });
});

describe("markAsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates notification read to true", async () => {
    const updated = { id: "n1", read: true };
    mockPrisma.notification.update.mockResolvedValue(updated);
    const result = await markAsRead("n1");
    expect(result).toEqual(updated);
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: "n1" },
      data: { read: true }
    });
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates all unread notifications for user", async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });
    const result = await markAllAsRead("u1");
    expect(result).toEqual({ count: 3 });
    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "u1", read: false },
      data: { read: true }
    });
  });
});
