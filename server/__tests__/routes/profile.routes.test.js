import { describe, it, expect, vi, beforeEach } from "vitest";
import supertest from "supertest";
import { createTestApp } from "./setup.js";

vi.mock("../../src/middleware/authMiddleware.js", () => ({
  default: (req, _res, next) => {
    req.userId = "test-user";
    req.user = { id: "test-user" };
    next();
  }
}));

vi.mock("../../src/middleware/upload.js", () => ({
  profileUpload: {
    single: () => (_req, _res, next) => next()
  },
  eventBannerUpload: {
    single: () => (_req, _res, next) => next()
  }
}));

vi.mock("../../src/modules/profile/profile.service.js", () => ({
  getUserProfile: vi
    .fn()
    .mockResolvedValue({ firstName: "John", lastName: "Doe" }),
  updateUserProfile: vi
    .fn()
    .mockResolvedValue({ firstName: "Jane", lastName: "Doe" })
}));

vi.mock("../../src/modules/event/event.service.js", () => ({
  getUserRegistrations: vi.fn().mockResolvedValue([])
}));

vi.mock("../../src/lib/prisma.js", () => ({
  default: {}
}));

const { default: profileRoutes } =
  await import("../../src/modules/profile/profile.routes.js");

describe("Profile routes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp("/users", profileRoutes);
  });

  it("GET /users/profile returns 200 with profile", async () => {
    const res = await supertest(app).get("/users/profile");
    expect(res.status).toBe(200);
    expect(res.body.data.profile).toEqual({
      firstName: "John",
      lastName: "Doe"
    });
  });

  it("PUT /users/profile with valid body returns 200", async () => {
    const res = await supertest(app)
      .put("/users/profile")
      .send({ firstName: "Jane", lastName: "Doe" });
    expect(res.status).toBe(200);
  });

  it("PUT /users/profile with invalid body returns 400", async () => {
    const res = await supertest(app)
      .put("/users/profile")
      .send({ firstName: "" });
    expect(res.status).toBe(400);
  });

  it("GET /users/events returns 200", async () => {
    const res = await supertest(app).get("/users/events");
    expect(res.status).toBe(200);
  });
});
