import jwt from "jsonwebtoken";

const userMiddleware = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};

export default userMiddleware;
