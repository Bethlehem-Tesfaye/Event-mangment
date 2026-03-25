import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  profile: {
    findUnique: vi.fn(),
    update: vi.fn()
  }
};

vi.mock("../../lib/prisma.js", () => ({ default: mockPrisma }));

const { getUserProfile, updateUserProfile } = await import(
  "./profile.service.js"
);

describe("getUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns profile when found", async () => {
    const profile = { userId: "u1", firstName: "John" };
    mockPrisma.profile.findUnique.mockResolvedValue(profile);
    const result = await getUserProfile("u1");
    expect(result).toEqual(profile);
    expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: "u1" }
    });
  });

  it("throws 404 when profile not found", async () => {
    mockPrisma.profile.findUnique.mockResolvedValue(null);
    await expect(getUserProfile("u-none")).rejects.toThrow("No profile found");
  });
});

describe("updateUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns updated profile", async () => {
    const updated = { userId: "u1", firstName: "Jane" };
    mockPrisma.profile.update.mockResolvedValue(updated);
    const result = await updateUserProfile("u1", { firstName: "Jane" });
    expect(result).toEqual(updated);
    expect(mockPrisma.profile.update).toHaveBeenCalledWith({
      where: { userId: "u1" },
      data: { firstName: "Jane" }
    });
  });

  it("throws 404 on P2025 error", async () => {
    const prismaErr = new Error("Record not found");
    prismaErr.code = "P2025";
    mockPrisma.profile.update.mockRejectedValue(prismaErr);
    await expect(updateUserProfile("u-none", {})).rejects.toThrow(
      "Profile not found"
    );
  });

  it("re-throws other errors", async () => {
    const err = new Error("DB fail");
    mockPrisma.profile.update.mockRejectedValue(err);
    await expect(updateUserProfile("u1", {})).rejects.toThrow("DB fail");
  });
});
