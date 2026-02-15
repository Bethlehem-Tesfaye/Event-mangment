import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  setPasswordSchema
} from "./user.schema.js";

describe("registerSchema", () => {
  it("accepts valid email and password", () => {
    const result = registerSchema.parse({
      email: "user@example.com",
      password: "123456"
    });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => registerSchema.parse({ email: "bad", password: "123456" })).toThrow();
  });

  it("rejects password shorter than 6 characters", () => {
    expect(() =>
      registerSchema.parse({ email: "u@e.com", password: "12345" })
    ).toThrow();
  });

  it("rejects extra fields (strict)", () => {
    expect(() =>
      registerSchema.parse({
        email: "u@e.com",
        password: "123456",
        extra: "nope"
      })
    ).toThrow();
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.parse({
      email: "a@b.com",
      password: "x"
    });
    expect(result.email).toBe("a@b.com");
  });

  it("rejects empty password", () => {
    expect(() => loginSchema.parse({ email: "a@b.com", password: "" })).toThrow();
  });

  it("rejects missing email", () => {
    expect(() => loginSchema.parse({ password: "abc" })).toThrow();
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid current and new passwords", () => {
    const result = changePasswordSchema.parse({
      currentPassword: "oldpwd1",
      newPassword: "newpwd1"
    });
    expect(result.newPassword).toBe("newpwd1");
  });

  it("rejects currentPassword shorter than 6", () => {
    expect(() =>
      changePasswordSchema.parse({
        currentPassword: "short",
        newPassword: "newpwd1"
      })
    ).toThrow();
  });

  it("rejects newPassword shorter than 6", () => {
    expect(() =>
      changePasswordSchema.parse({
        currentPassword: "oldpwd1",
        newPassword: "short"
      })
    ).toThrow();
  });
});

describe("setPasswordSchema", () => {
  it("accepts valid newPassword", () => {
    const result = setPasswordSchema.parse({ newPassword: "abcdef" });
    expect(result.newPassword).toBe("abcdef");
  });

  it("rejects short newPassword", () => {
    expect(() => setPasswordSchema.parse({ newPassword: "abc" })).toThrow();
  });
});
