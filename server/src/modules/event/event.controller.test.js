import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockReq } from "../../../__tests__/helpers/createMockReq.js";
import { createMockRes } from "../../../__tests__/helpers/createMockRes.js";

vi.mock("./event.service.js", () => ({
  getEvents: vi.fn(),
  getEventById: vi.fn(),
  purchaseTicket: vi.fn(),
  createEvent: vi.fn(),
  getEventDetailById: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  addCategoryToEvent: vi.fn(),
  removeCategoryFromEvent: vi.fn(),
  getEventAttendeesService: vi.fn(),
  getEventAnalytics: vi.fn(),
  getAllCategories: vi.fn(),
  getOrganizerEvents: vi.fn(),
  getDashboardStatsService: vi.fn(),
  getUserRegistrations: vi.fn()
}));

vi.mock("json2csv", () => {
  class MockParser {
    // eslint-disable-next-line class-methods-use-this
    parse() {
      return "csv-data";
    }
  }
  return { Parser: MockParser };
});

const eventService = await import("./event.service.js");
const {
  listEvents,
  getEventDetails,
  purchaseTicket,
  createEvent,
  getEventDetailById,
  updateEvent,
  deleteEvent,
  addCategoryToEvent,
  removeCategoryFromEvent,
  getEventAttendees,
  getEventAnalytics,
  getAllCategoriesController,
  listOrganizerEvents,
  getDashboardStatsController,
  getUserRegistrationsController
} = await import("./event.controller.js");

describe("listEvents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with events and totalCount", async () => {
    eventService.getEvents.mockResolvedValue({
      events: [{ id: "e1" }],
      totalCount: 1
    });
    const req = createMockReq({ query: { limit: "10", offset: "0" } });
    const res = createMockRes();
    const next = vi.fn();
    await listEvents(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: "e1" }],
      totalCount: 1
    });
  });

  it("passes search and category to service", async () => {
    eventService.getEvents.mockResolvedValue({ events: [], totalCount: 0 });
    const req = createMockReq({
      query: { search: "test", category: "Tech" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await listEvents(req, res, next);
    expect(eventService.getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ search: "test", categoryName: "Tech" })
    );
  });
});

describe("getEventDetails", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with event", async () => {
    eventService.getEventById.mockResolvedValue({ id: "e1" });
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await getEventDetails(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ event: { id: "e1" } });
  });
});

describe("purchaseTicket controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with registration", async () => {
    eventService.purchaseTicket.mockResolvedValue({ id: "r1" });
    const req = createMockReq({
      params: { eventId: "e1" },
      body: { ticketId: "1", quantity: "2" },
      userId: "u1"
    });
    const res = createMockRes();
    const next = vi.fn();
    await purchaseTicket(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(eventService.purchaseTicket).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "e1", ticketId: "1", userId: "u1" }),
      expect.anything()
    );
  });
});

describe("createEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with created event", async () => {
    eventService.createEvent.mockResolvedValue({ id: "e1" });
    const req = createMockReq({
      userId: "u1",
      body: { title: "Test" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await createEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("uses file path as eventBannerUrl when file uploaded", async () => {
    eventService.createEvent.mockResolvedValue({ id: "e1" });
    const req = createMockReq({
      userId: "u1",
      body: { title: "Test" },
      file: { path: "/uploads/banner.jpg" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await createEvent(req, res, next);
    expect(eventService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventBannerUrl: "/uploads/banner.jpg" }),
      expect.anything()
    );
  });

  it("normalizes in-person locationType", async () => {
    eventService.createEvent.mockResolvedValue({ id: "e1" });
    const req = createMockReq({
      userId: "u1",
      body: { title: "T", locationType: "in-person" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await createEvent(req, res, next);
    expect(eventService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ locationType: "inPerson" }),
      expect.anything()
    );
  });
});

describe("getEventDetailById controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with event", async () => {
    eventService.getEventDetailById.mockResolvedValue({ id: "e1" });
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await getEventDetailById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("updateEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with updated event", async () => {
    eventService.updateEvent.mockResolvedValue({ id: "e1" });
    const req = createMockReq({
      params: { eventId: "e1" },
      userId: "u1",
      query: { status: "published" },
      body: { title: "Updated" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await updateEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(eventService.updateEvent).toHaveBeenCalledWith(
      "e1",
      "u1",
      expect.objectContaining({ title: "Updated", status: "published" }),
      expect.anything()
    );
  });
});

describe("deleteEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with deleted event", async () => {
    eventService.deleteEvent.mockResolvedValue({ id: "e1" });
    const req = createMockReq({ params: { eventId: "e1" } });
    const res = createMockRes();
    const next = vi.fn();
    await deleteEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("addCategoryToEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201", async () => {
    eventService.addCategoryToEvent.mockResolvedValue({ id: 1 });
    const req = createMockReq({
      params: { eventId: "e1" },
      body: { categoryId: 5 }
    });
    const res = createMockRes();
    const next = vi.fn();
    await addCategoryToEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("removeCategoryFromEvent controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200", async () => {
    eventService.removeCategoryFromEvent.mockResolvedValue({ id: 1 });
    const req = createMockReq({
      params: { eventId: "e1", categoryId: "3" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await removeCategoryFromEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("getEventAttendees controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with JSON by default", async () => {
    const attendees = [{ full_name: "John" }];
    eventService.getEventAttendeesService.mockResolvedValue(attendees);
    const req = createMockReq({
      params: { eventId: "e1" },
      query: {}
    });
    const res = createMockRes();
    const next = vi.fn();
    await getEventAttendees(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { attendees } });
  });

  it("returns CSV when format=csv", async () => {
    const attendees = [{ full_name: "John" }];
    eventService.getEventAttendeesService.mockResolvedValue(attendees);
    const req = createMockReq({
      params: { eventId: "e1" },
      query: { format: "csv" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await getEventAttendees(req, res, next);
    expect(res.header).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.attachment).toHaveBeenCalledWith("event-e1-attendees.csv");
    expect(res.send).toHaveBeenCalledWith("csv-data");
  });
});

describe("getEventAnalytics controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with analytics", async () => {
    eventService.getEventAnalytics.mockResolvedValue({ totalRevenue: 100 });
    const req = createMockReq({
      params: { eventId: "e1" },
      userId: "u1"
    });
    const res = createMockRes();
    const next = vi.fn();
    await getEventAnalytics(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { totalRevenue: 100 } });
  });
});

describe("getAllCategoriesController", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with categories", async () => {
    eventService.getAllCategories.mockResolvedValue([{ id: 1, name: "Tech" }]);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();
    await getAllCategoriesController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("listOrganizerEvents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with events and totalCount", async () => {
    eventService.getOrganizerEvents.mockResolvedValue({
      events: [],
      totalCount: 0
    });
    const req = createMockReq({
      userId: "u1",
      query: { limit: "10", offset: "0" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await listOrganizerEvents(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("getDashboardStatsController", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with stats", async () => {
    eventService.getDashboardStatsService.mockResolvedValue({
      totalEvents: 5
    });
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getDashboardStatsController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { totalEvents: 5 }
    });
  });
});

describe("getUserRegistrationsController", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with registrations", async () => {
    eventService.getUserRegistrations.mockResolvedValue([{ id: "r1" }]);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getUserRegistrationsController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: "r1" }] });
  });
});
