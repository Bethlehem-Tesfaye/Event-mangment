import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../modules/auth/auth.js";

const requireRealUserMiddleware = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    // No session → block
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    // Anonymous user → block
    if (session.user.isAnonymous === true) {
      return res.status(403).json({
        error: "Please register or login to access this feature"
      });
    }

    // Real user allowed
    req.user = session.user;
    req.userId = session.user.id;

    return next();
  } catch (err) {
    console.error("requireRealUserMiddleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireRealUserMiddleware;
