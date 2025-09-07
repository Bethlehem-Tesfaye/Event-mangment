import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import conn from "./db/db.js";
import routes from "./routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

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
app.use("/api/v1", routes);
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
