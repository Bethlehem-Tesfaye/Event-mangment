import { describe, it, expect } from "vitest";
import { profileSchema } from "./profile.schema.js";

describe("profileSchema", () => {
  it("accepts valid profile", () => {
    const result = profileSchema.parse({
      firstName: "John",
      lastName: "Doe"
    });
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Doe");
  });

  it("requires firstName", () => {
    expect(() => profileSchema.parse({ lastName: "Doe" })).toThrow();
  });

  it("requires lastName", () => {
    expect(() => profileSchema.parse({ firstName: "John" })).toThrow();
  });

  it("rejects empty firstName", () => {
    expect(() =>
      profileSchema.parse({ firstName: "", lastName: "Doe" })
    ).toThrow();
  });

  it("enforces firstName max length of 50", () => {
    expect(() =>
      profileSchema.parse({ firstName: "A".repeat(51), lastName: "Doe" })
    ).toThrow();
  });

  it("enforces lastName max length of 50", () => {
    expect(() =>
      profileSchema.parse({ firstName: "John", lastName: "D".repeat(51) })
    ).toThrow();
  });

  it("accepts valid phone number", () => {
    const result = profileSchema.parse({
      firstName: "J",
      lastName: "D",
      phone: "+251912345678"
    });
    expect(result.phone).toBe("+251912345678");
  });

  it("rejects invalid phone number", () => {
    expect(() =>
      profileSchema.parse({
        firstName: "J",
        lastName: "D",
        phone: "abc"
      })
    ).toThrow();
  });

  it("accepts optional fields", () => {
    const result = profileSchema.parse({
      firstName: "J",
      lastName: "D",
      address: "123 Main St",
      country: "Ethiopia",
      city: "Addis Ababa"
    });
    expect(result.country).toBe("Ethiopia");
  });

  it("enforces address max length of 100", () => {
    expect(() =>
      profileSchema.parse({
        firstName: "J",
        lastName: "D",
        address: "A".repeat(101)
      })
    ).toThrow();
  });

  it("trims whitespace", () => {
    const result = profileSchema.parse({
      firstName: "  John  ",
      lastName: "  Doe  "
    });
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Doe");
  });
});
