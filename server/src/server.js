import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import { initializeSocketIO } from "./lib/socketio.js";
import conn from "./db/db.js";
import routes from "./routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import requestLogger from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { sendEmailRoute } from "./lib/email/sendEmailRoute.js";
import { sendReminderRoute } from "./lib/email/sendReminderRoute.js";
import { auth } from "./modules/auth/auth.js";
import { chapaRoutes } from "./modules/payment/chapa.routes.js";
import { organizerSettingsRoutes } from "./modules/payment/organizerSettingsRoutes.js";

dotenv.config();
const port = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://frontend-event-mangment-pr-60.onrender.com",
  "https://sever-event-mangment-pr-60.onrender.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

const io = initializeSocketIO(server);

io.use(async (socket, next) => {
  logger.info("New socket connection attempt");

  const { cookie } = socket.handshake.headers || {};
  if (!cookie) {
    logger.warn("No cookie found in socket handshake");
    return next(new Error("Unauthorized: No cookie"));
  }

  try {
    const session = await auth.api.getSession({
      headers: { cookie }
    });

    logger.debug("Session returned from auth provider");

    if (!session?.user) {
      logger.warn("Socket authentication failed: session invalid");
      return next(new Error("Unauthorized: Session invalid"));
    }
    /* eslint-disable-next-line no-param-reassign */
    socket.data.user = session.user;
    logger.info(`Socket auth success for user ${socket.data.user.id}`);

    return next();
  } catch (err) {
    logger.error("Error while retrieving session for socket auth", {
      error: err
    });
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.data.user.id}`);

  socket.join(`user:${socket.data.user.id}`);
  socket.emit("notification", { message: "Socket connected successfully!" });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.data.user.id}`);
  });
});
app.get("/test/socket", (req, res) => {
  io.emit("notification", { message: "Backend test emit!" });
  logger.info("Test socket emit triggered");
  res.send("Emitted!");
});

// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || true,
//     credentials: true
//   })
// );
app.use(cookieParser());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      try {
        req.rawBody = buf && buf.length ? buf.toString() : "";
      } catch (e) {
        req.rawBody = "";
      }
    }
  })
);

app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("server works!!!");
});
app.use(passport.initialize());
// app.use("/workflow/email", emailWorkflow);
app.post("/api/send-email", ...sendEmailRoute);
app.post("/api/reminders/send", ...sendReminderRoute);
app.use("/api/v1", routes);
app.use("/api/auth", authRoutes);
app.use("/api/chapa", chapaRoutes);
app.use("/api/chapa/settings", organizerSettingsRoutes);
app.use(errorMiddleware);

conn
  .query("SELECT 1")
  .then(() => {
    logger.info("database connected");
    server.listen(port, () => {
      logger.info(
        `server running on port ${port} - env=${process.env.NODE_ENV || "development"}`
      );
    });
  })
  .catch((err) => {
    logger.error("database connection failed", {
      stack: err?.stack,
      error: err
    });
  });
