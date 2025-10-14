import fs from "fs";
import dotenv from "dotenv";
import { Resend } from "resend";
import logger from "../utils/logger.js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
  async sendMail({ to, subject, html, attachments }) {
    const files = attachments?.map((a) => ({
      filename: a.filename,
      content: fs.readFileSync(a.path).toString("base64")
    }));

    const data = await resend.emails.send({
      from: "EventLight <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments: files
    });

    logger.info("Email sent successfully via Resend", { to, subject });
    return data;
  }
};

export default transporter;
