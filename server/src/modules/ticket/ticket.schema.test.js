import { describe, it, expect } from "vitest";
import { createTicketSchema, UpdateTicketSchema } from "./ticket.schema.js";

describe("createTicketSchema", () => {
  it("accepts valid ticket data", () => {
    const result = createTicketSchema.parse({
      type: "VIP",
      price: 100,
      totalQuantity: 50
    });
    expect(result.type).toBe("VIP");
    expect(result.price).toBe(100);
    expect(result.totalQuantity).toBe(50);
  });

  it("coerces string price to number", () => {
    const result = createTicketSchema.parse({
      type: "General",
      price: "0",
      totalQuantity: "10"
    });
    expect(result.price).toBe(0);
    expect(result.totalQuantity).toBe(10);
  });

  it("rejects negative price", () => {
    expect(() =>
      createTicketSchema.parse({ type: "T", price: -1, totalQuantity: 10 })
    ).toThrow();
  });

  it("rejects non-integer totalQuantity", () => {
    expect(() =>
      createTicketSchema.parse({ type: "T", price: 10, totalQuantity: 5.5 })
    ).toThrow();
  });

  it("rejects zero totalQuantity", () => {
    expect(() =>
      createTicketSchema.parse({ type: "T", price: 10, totalQuantity: 0 })
    ).toThrow();
  });

  it("allows optional maxPerUser", () => {
    const result = createTicketSchema.parse({
      type: "T",
      price: 10,
      totalQuantity: 5,
      maxPerUser: 2
    });
    expect(result.maxPerUser).toBe(2);
  });
});

describe("UpdateTicketSchema", () => {
  it("accepts empty object (all optional)", () => {
    const result = UpdateTicketSchema.parse({});
    expect(result).toBeDefined();
  });

  it("accepts partial updates", () => {
    const result = UpdateTicketSchema.parse({ price: 50 });
    expect(result.price).toBe(50);
  });

  it("rejects negative price", () => {
    expect(() => UpdateTicketSchema.parse({ price: -5 })).toThrow();
  });
});
