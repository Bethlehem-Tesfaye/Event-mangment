import * as userService from "./user.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await userService.registerUser(
      req.body
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    return res.status(201).json({ data: { user, accessToken } });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await userService.loginUser(
      req.body
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    return res.status(200).json({ data: { user, accessToken } });
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const incoming = req.cookies?.refreshToken;
    const { user, accessToken, refreshToken } =
      await userService.refreshTokens(incoming);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    return res.status(200).json({ data: { user, accessToken }, x: "jj" });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.userId) await userService.logoutUser(req.userId);

    res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: 0 });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(200).json({ data: { user: null } });

    const { user } = await userService.refreshTokens(refreshToken);
    return res.status(200).json({ data: { user } });
  } catch (error) {
    return next(error);
  }
};

export async function changePassword(req, res, next) {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);
    return res.status(200).json({ message: "Password changed" });
  } catch (err) {
    return next(err);
  }
}
