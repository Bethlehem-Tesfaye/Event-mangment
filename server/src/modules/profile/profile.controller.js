import * as profileService from "./profile.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getUserProfile(req.userId);
    return res.status(200).json({ data: { profile } });
  } catch (error) {
    return next(error);
  }
};
export const setProfile = async (req, res, next) => {
  try {
    const profileData = { ...req.body };
    if (req.file?.path) {
      profileData.picture = req.file.path;
    }
    const updatedProfile = await profileService.updateUserProfile(
      req.userId,
      profileData
    );

    return res.status(200).json({ data: { profile: updatedProfile } });
  } catch (error) {
    return next(error);
  }
};