import jwt from "jsonwebtoken";

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded?.userId ?? null;
    return next();
  } catch (error) {
    req.userId = null;
    return next();
  }
};

export default optionalAuthMiddleware;
