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
    const updatedProfile = await profileService.updateUserProfile(
      req.userId,
      req.body
    );
    return res.status(200).json({ data: { profile: updatedProfile } });
  } catch (error) {
    return next(error);
  }
};


