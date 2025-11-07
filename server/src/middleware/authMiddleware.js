import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../modules/auth/auth.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get the session from the request headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    // Attach user to the request object
    req.user = session.user;
    req.userId = session.user.id;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default authMiddleware;
