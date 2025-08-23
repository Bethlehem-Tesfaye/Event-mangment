import CustomError from "../../utils/customError.js";
import prisma from "../../lib/prisma.js";

export const getUserProfile = async (userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new CustomError("No profile found", 404);
  return profile;
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: profileData
    });
    return updatedProfile;
  } catch (error) {
    if (error.code === "P2025") throw new CustomError("Profile not found", 404);
    throw error;
  }
};


