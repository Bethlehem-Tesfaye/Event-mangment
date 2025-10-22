import dotenv from "dotenv";
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

dotenv.config();

// create SMTP client
const smtpClient = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // optional: some environments need this
  tls: {
    rejectUnauthorized: false
  }
});

const transporter = {
  async sendMail({ to, subject, html, attachments }) {
    // map attachments to nodemailer format (use path where possible so nodemailer streams file)
    const files = attachments?.map((a) => ({
      filename: a.filename,
      path: a.path,
      cid: a.cid // allow inline images with cid if provided
    }));

    const from = process.env.SENDER_EMAIL || process.env.SMTP_USER;

    try {
      const info = await smtpClient.sendMail({
        from,
        to,
        subject,
        html,
        attachments: files
      });

      logger.info("Email sent successfully via SMTP", {
        to,
        subject,
        messageId: info.messageId,
        response: info.response
      });

      return info;
    } catch (err) {
      logger.error("SMTP send failed", {
        to,
        subject,
        message: err?.message,
        stack: err?.stack
      });
      throw err;
    }
  }
};

export default transporter;
