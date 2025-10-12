/* eslint-disable no-unused-vars */
import util from "util";
import logger from "../utils/logger.js";

const redactBody = (body = {}) => {
  try {
    const b = { ...body };
    if (b.password) b.password = "[REDACTED]";
    if (b.currentPassword) b.currentPassword = "[REDACTED]";
    if (b.newPassword) b.newPassword = "[REDACTED]";
    return b;
  } catch {
    return {};
  }
};

const extractUnderlying = (err) => {
  if (!err || typeof err !== "object") return err;
  // common wrapper keys that may hold the original error
  const keys = ["cause", "originalError", "inner", "error", "err", "original"];
  for (const k of keys) {
    if (err[k]) return err[k];
  }
  return err;
};

const errorMiddleware = async (err, req, res, _next) => {
  let safeBody = {};
  try {
    if (req && req.body) {
      safeBody = redactBody(req.body);
    }
  } catch (e) {
    safeBody = {};
  }

  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  const rawToLog = extractUnderlying(err);

  try {
    const inspected = util.inspect(rawToLog, { depth: null, colors: false });
    logger.error(inspected);
  } catch (inspectErr) {
    logger.error("Error inspecting error object", inspectErr);
    logger.error(rawToLog?.stack || rawToLog || err?.stack || err);
  }

  logger.error(
    `Request: ${req?.method || "?"} ${req?.originalUrl || "?"} - IP: ${req?.ip || "?"}`
  );
  if (Object.keys(safeBody).length) {
    logger.error(`Body: ${JSON.stringify(safeBody)}`);
  }

  const isDebug =
    process.env.LOG_LEVEL === "debug" || process.env.NODE_ENV !== "production";
  res.status(status).json({
    success: false,
    message,
    ...(isDebug ? { stack: err?.stack } : {})
  });
};

export default errorMiddleware;
