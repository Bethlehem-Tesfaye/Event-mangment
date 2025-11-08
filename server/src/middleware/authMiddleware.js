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
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default authMiddleware;
