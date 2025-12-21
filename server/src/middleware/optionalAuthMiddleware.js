import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../modules/auth/auth.js";
import logger from "../utils/logger.js";

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (session && session.user) {
      req.user = session.user;
      req.userId = session.user.id;
      if (process.env.NODE_ENV !== "production") {
        logger.info("optionalAuthMiddleware: session found", {
          user: req.user
        });
      }
    } else {
      req.user = null;
      req.userId = null;
      if (process.env.NODE_ENV !== "production") {
        logger.info("optionalAuthMiddleware: no session found");
      }
    }
  } catch (err) {
    req.user = null;
    req.userId = null;
    if (process.env.NODE_ENV !== "production") {
      logger.info("optionalAuthMiddleware: error fetching session", {
        message: err?.message || String(err)
      });
    }
  }

  return next();
};

export default optionalAuthMiddleware;
