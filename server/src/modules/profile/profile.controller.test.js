import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockReq } from "../../../__tests__/helpers/createMockReq.js";
import { createMockRes } from "../../../__tests__/helpers/createMockRes.js";

vi.mock("./profile.service.js", () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn()
}));

const { getUserProfile, updateUserProfile } = await import(
  "./profile.service.js"
);
const { getProfile, setProfile } = await import("./profile.controller.js");

describe("getProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with profile data", async () => {
    const profile = { firstName: "John" };
    getUserProfile.mockResolvedValue(profile);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { profile } });
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    getUserProfile.mockRejectedValue(err);
    const req = createMockReq({ userId: "u1" });
    const res = createMockRes();
    const next = vi.fn();
    await getProfile(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("setProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with updated profile", async () => {
    const updated = { firstName: "Jane" };
    updateUserProfile.mockResolvedValue(updated);
    const req = createMockReq({
      userId: "u1",
      body: { firstName: "Jane" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await setProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { profile: updated } });
  });

  it("includes file path as picture when file uploaded", async () => {
    const updated = { picture: "/path/to/pic.jpg" };
    updateUserProfile.mockResolvedValue(updated);
    const req = createMockReq({
      userId: "u1",
      body: { firstName: "J" },
      file: { path: "/path/to/pic.jpg" }
    });
    const res = createMockRes();
    const next = vi.fn();
    await setProfile(req, res, next);
    expect(updateUserProfile).toHaveBeenCalledWith("u1", {
      firstName: "J",
      picture: "/path/to/pic.jpg"
    });
  });

  it("forwards errors to next", async () => {
    const err = new Error("fail");
    updateUserProfile.mockRejectedValue(err);
    const req = createMockReq({ userId: "u1", body: {} });
    const res = createMockRes();
    const next = vi.fn();
    await setProfile(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
