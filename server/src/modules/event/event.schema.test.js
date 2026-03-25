import { describe, it, expect } from "vitest";
import {
  createEventSchema,
  updateEventSchema,
  createCategorySchema
} from "./event.schema.js";

describe("createEventSchema", () => {
  it("requires title", () => {
    expect(() => createEventSchema.parse({})).toThrow();
  });

  it("accepts minimal valid event (title only)", () => {
    const result = createEventSchema.parse({ title: "My Event" });
    expect(result.title).toBe("My Event");
  });

  it("coerces startDatetime to Date", () => {
    const result = createEventSchema.parse({
      title: "E",
      startDatetime: "2025-06-01T10:00:00Z"
    });
    expect(result.startDatetime).toBeInstanceOf(Date);
  });

  it("accepts locationType enum values", () => {
    const online = createEventSchema.parse({
      title: "E",
      locationType: "online"
    });
    expect(online.locationType).toBe("online");

    const inPerson = createEventSchema.parse({
      title: "E",
      locationType: "in-person"
    });
    expect(inPerson.locationType).toBe("in-person");
  });

  it("rejects invalid locationType", () => {
    expect(() =>
      createEventSchema.parse({ title: "E", locationType: "hybrid" })
    ).toThrow();
  });

  it("accepts optional fields", () => {
    const result = createEventSchema.parse({
      title: "E",
      description: "desc",
      location: "NYC",
      duration: "120",
      eventBannerUrl: "https://img.com/pic.jpg"
    });
    expect(result.duration).toBe(120);
    expect(result.eventBannerUrl).toBe("https://img.com/pic.jpg");
  });

  it("rejects invalid eventBannerUrl", () => {
    expect(() =>
      createEventSchema.parse({ title: "E", eventBannerUrl: "not-a-url" })
    ).toThrow();
  });
});

describe("updateEventSchema", () => {
  it("accepts empty object (all optional)", () => {
    const result = updateEventSchema.parse({});
    expect(result).toBeDefined();
  });

  it("accepts status enum values", () => {
    for (const status of ["draft", "published", "cancelled"]) {
      const result = updateEventSchema.parse({ status });
      expect(result.status).toBe(status);
    }
  });

  it("rejects invalid status", () => {
    expect(() => updateEventSchema.parse({ status: "archived" })).toThrow();
  });

  it("preprocesses valid startDatetime string to ISO format", () => {
    const result = updateEventSchema.parse({
      startDatetime: "2025-06-01T10:00:00Z"
    });
    expect(result.startDatetime).toBeDefined();
  });
});

describe("createCategorySchema", () => {
  it("requires integer categoryId", () => {
    const result = createCategorySchema.parse({ categoryId: 5 });
    expect(result.categoryId).toBe(5);
  });

  it("rejects non-integer categoryId", () => {
    expect(() => createCategorySchema.parse({ categoryId: 1.5 })).toThrow();
  });

  it("rejects missing categoryId", () => {
    expect(() => createCategorySchema.parse({})).toThrow();
  });
});
