import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validate } from "./validate.js";

const schema = z.object({
  name: z.string(),
  age: z.coerce.number().int().positive()
});

function callValidate(body) {
  const req = { body };
  const res = {};
  const next = vi.fn();
  validate(schema)(req, res, next);
  return { req, res, next };
}

describe("validate middleware", () => {
  it("calls next() on valid data", () => {
    const { next } = callValidate({ name: "Alice", age: 25 });
    expect(next).toHaveBeenCalledWith();
  });

  it("parses and transforms req.body", () => {
    const { req, next } = callValidate({ name: "Bob", age: "30" });
    expect(next).toHaveBeenCalledWith();
    expect(req.body.age).toBe(30);
  });

  it("calls next with CustomError(400) on invalid data", () => {
    const { next } = callValidate({ name: 123 });
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
  });

  it("includes field paths in error message", () => {
    const { next } = callValidate({});
    const err = next.mock.calls[0][0];
    expect(err.message).toContain("name");
  });

  it("handles non-Zod errors gracefully", () => {
    const badSchema = { parse: () => { throw new Error("boom"); } };
    const req = { body: {} };
    const next = vi.fn();
    validate(badSchema)(req, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Invalid request data");
  });
});
