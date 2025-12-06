import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import logger from "../utils/logger.js";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SENDER_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  }
});

export const sendMail = async ({ to, subject, html, attachments }) => {
  try {
    const { token: accessToken } = await oAuth2Client.getAccessToken();

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
      attachments,
      auth: { type: "OAuth2", user: process.env.SENDER_EMAIL, accessToken }
    });

    logger.info("Email sent via Gmail OAuth2", {
      to,
      subject,
      messageId: info.messageId
    });
    return info;
  } catch (err) {
    logger.error("Email sending failed", { error: err });
    throw err;
  }
};

export default { sendMail };
