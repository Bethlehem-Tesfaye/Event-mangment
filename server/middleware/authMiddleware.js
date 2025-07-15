import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";

const userMiddleware = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new CustomError("Unauthorized: No token", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    if (!req.userId) {
      return next(new CustomError("Unauthorized: Invalid token", 401));
    }

    return next();
  } catch (error) {
    return next(new CustomError("Unauthorized", 401));
  }
};

export default userMiddleware;
