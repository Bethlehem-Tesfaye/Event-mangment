import dotenv from "dotenv";
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify connection and log result
transporter
  .verify()
  .then(() => {
    logger.info("SMTP transporter connected and ready");
  })
  .catch((err) => {
    logger.error("SMTP transporter connection failed", {
      message: err?.message || String(err),
      stack: err?.stack
    });
  });

export default transporter;
