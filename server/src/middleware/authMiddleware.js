import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || "";

  if (!token) {
    return next(new CustomError("Unauthorized: No token", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userId = decoded.userId;

    if (!req.userId) {
      return next(new CustomError("Unauthorized: Invalid token", 401));
    }

    return next();
  } catch (error) {
    return next(new CustomError("Unauthorized: Token expired or invalid", 401));
  }
};

export default authMiddleware;
