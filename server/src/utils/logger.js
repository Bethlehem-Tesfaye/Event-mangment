import winston from "winston";

const { combine, timestamp, errors, printf, colorize } = winston.format;

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue"
});

// avoid shadowing outer `timestamp` by renaming the destructured param to `ts`
const consoleFormatter = printf(
  ({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    if (stack) return `${ts} ${level}: ${message}\n${stack}${metaStr}`;
    return `${ts} ${level}: ${message}${metaStr}`;
  }
);

const fileFormatter = printf(
  ({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    if (stack) return `${ts} ${level}: ${message}\n${stack}${metaStr}`;
    return `${ts} ${level}: ${message}${metaStr}`;
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        consoleFormatter
      ),
      stderrLevels: ["error"]
    }),

    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: combine(
              timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              errors({ stack: true }),
              fileFormatter
            )
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
            format: combine(
              timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              errors({ stack: true }),
              fileFormatter
            )
          })
        ]
      : [])
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" })
  ]
});

export default logger;
