import logger from "../utils/logger.js";

export default function requestLogger(req, res, next) {
  const start = Date.now();
  logger.info(`[REQ] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  if (req.method !== "GET" && req.body && Object.keys(req.body).length) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "[REDACTED]";
    if (safeBody.currentPassword) safeBody.currentPassword = "[REDACTED]";
    if (safeBody.newPassword) safeBody.newPassword = "[REDACTED]";
    logger.debug(`[REQ BODY] ${JSON.stringify(safeBody)}`);
  }

  res.on("finish", () => {
    const ms = Date.now() - start;
    logger.info(
      `[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
    );
  });

  next();
}
