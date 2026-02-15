import { describe, it, expect } from "vitest";
import CustomError from "./customError.js";

describe("CustomError", () => {
  it("sets message and statusCode", () => {
    const err = new CustomError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
  });

  it("extends Error", () => {
    const err = new CustomError("Bad request", 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CustomError);
  });

  it("has a stack trace", () => {
    const err = new CustomError("Server error", 500);
    expect(err.stack).toBeDefined();
  });

  it("defaults statusCode to undefined when not provided", () => {
    const err = new CustomError("Oops");
    expect(err.message).toBe("Oops");
    expect(err.statusCode).toBeUndefined();
  });
});
