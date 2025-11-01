import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const optionalAuthMiddleware = (req, res, next) => {
  let token = null;
  const header =
    (req.headers &&
      (req.headers.authorization || req.headers["x-access-token"])) ||
    "";
  if (typeof header === "string" && header.trim()) {
    token = header.trim().startsWith("Bearer ")
      ? header.trim().slice(7).trim()
      : header.trim();
  }

  if (!token && req.cookies) {
    const cookieNames = [
      "accessToken",
      "access_token",
      "token",
      "authToken",
      "authorization"
    ];
    for (const name of cookieNames) {
      if (req.cookies[name]) {
        const val = String(req.cookies[name] || "").trim();
        token = val.startsWith("Bearer ") ? val.slice(7).trim() : val;
        if (token) break;
      }
    }
  }

  if (!token) {
    req.userId = null;
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const rawId =
      decoded?.userId ??
      decoded?.id ??
      decoded?.sub ??
      (decoded?.user && (decoded.user.id ?? decoded.user.userId));

    const userId = rawId != null ? Number(rawId) : null;

    if (Number.isFinite(userId)) {
      req.userId = userId;
      req.user = { id: userId, email: decoded?.email ?? null };
      if (process.env.NODE_ENV !== "production")
        logger.info("optionalAuthMiddleware: decoded token", { decoded });
    } else {
      req.userId = null;
      req.user = null;
      if (process.env.NODE_ENV !== "production")
        logger.info("optionalAuthMiddleware: token decoded but no usable id", {
          decoded
        });
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production")
      logger.info("optionalAuthMiddleware: token verify failed", {
        message: err?.message || String(err)
      });
    req.userId = null;
    req.user = null;
  }

  return next();
};

export default optionalAuthMiddleware;
