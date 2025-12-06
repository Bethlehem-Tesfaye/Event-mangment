import dotenv from "dotenv";
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

dotenv.config();

const smtpClient = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

const transporter = {
  async sendMail({ to, subject, html, attachments }) {
    const files = attachments?.map((a) => ({
      filename: a.filename,
      path: a.path,
      cid: a.cid,
      content: a.content
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
