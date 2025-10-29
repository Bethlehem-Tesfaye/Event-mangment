import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import conn from "./db/db.js";
import routes from "./routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import requestLogger from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";
import passport from "passport";

dotenv.config();
const port = process.env.PORT || 4000;

const app = express();
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
app.use("/api/v1", routes);
app.use(errorMiddleware);

conn
  .query("SELECT 1")
  .then(() => {
    logger.info("database connected");
    app.listen(port, () => {
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
