import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import conn from "./db/db.js";
import userRouter from "./routes/userRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRouter from "./routes/authRoutes.js";

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

app.get("/", (req, res) => {
  res.send("server works!!!");
});
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);
app.use(errorMiddleware);

conn
  .query("SELECT 1")
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("database connected");
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server running on port ${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log("database connection failed", err);
  });
