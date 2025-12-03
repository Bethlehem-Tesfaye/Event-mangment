import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import conn from "./db/db.js";
import routes from "./routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import requestLogger from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { sendEmailRoute } from "./lib/email/sendEmailRoute.js";
import http from "http";
import { Server } from "socket.io";
import { auth } from "./modules/auth/auth.js";

dotenv.config();
const port = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"]
  }
});
app.set("io", io);

io.use(async (socket, next) => {
  console.log("🟡 New socket connection attempt");

  const cookie = socket.handshake.headers.cookie;
  console.log("➡️ Cookie sent from client:", cookie);

  if (!cookie) {
    console.log("❌ No cookie found in handshake");
    return next(new Error("Unauthorized: No cookie"));
  }

  try {
    const session = await auth.api.getSession({
      headers: { cookie }
    });

    console.log("➡️ Session returned:", session);

    if (!session?.user) {
      console.log("❌ Session invalid");
      return next(new Error("Unauthorized: Session invalid"));
    }

    socket.user = session.user;
    console.log("🟢 AUTH SUCCESS for user:", socket.user.id);

    next();
  } catch (err) {
    console.log("🔥 BetterAuth getSession FAILED:", err);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.id);

  socket.join(`user:${socket.user.id}`);
  socket.emit("notification", { message: "Socket connected successfully!" });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);
  });
});
app.get("/test/socket", (req, res) => {
  io.emit("notification", { message: "Backend test emit!" });
  res.send("Emitted!");
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());

// attach request logger early so all requests are logged
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("server works!!!");
});
app.use(passport.initialize());
// app.use("/workflow/email", emailWorkflow);
app.post("/api/send-email", ...sendEmailRoute);
app.use("/api/v1", routes);
app.use("/api/auth", authRoutes);
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
