// server/lib/mailer.js
import dotenv from "dotenv";
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

// Helper: base64url encode
const base64UrlEncode = (strOrBuffer) =>
  Buffer.from(strOrBuffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/**
 * Build a raw MIME message (multipart/mixed).
 * Supports:
 *  - html body
 *  - attachments: { filename, mimeType, content (Buffer), cid (optional) }
 * If an attachment has `cid`, it will include a Content-ID header so you can use <img src="cid:..."> in html.
 */
function buildRawMessage({ from, to, subject, html, attachments = [] }) {
  const boundary = `----=_Boundary_${Date.now()}`;
  const lines = [];

  // Headers
  lines.push(`From: ${from}`);
  lines.push(`To: ${to}`);
  lines.push(`Subject: ${subject}`);
  lines.push(`MIME-Version: 1.0`);
  lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  lines.push(""); // blank line

  // HTML part
  lines.push(`--${boundary}`);
  lines.push(`Content-Type: text/html; charset="UTF-8"`);
  lines.push(`Content-Transfer-Encoding: 7bit`);
  lines.push("");
  lines.push(html || "");
  lines.push("");

  // Attachments
  for (const att of attachments) {
    const contentBuffer = Buffer.isBuffer(att.content)
      ? att.content
      : typeof att.content === "string"
        ? // if provided as data URL like "data:image/png;base64,..." or bare base64
          att.content.startsWith("data:")
          ? Buffer.from(att.content.split(",")[1], "base64")
          : Buffer.from(att.content, "base64")
        : Buffer.from("", "base64");

    lines.push(`--${boundary}`);
    lines.push(
      `Content-Type: ${att.mimeType || "application/octet-stream"}; name="${att.filename}"`
    );

    // If a cid is present we put it inline, else as attachment
    if (att.cid) {
      lines.push(`Content-Disposition: inline; filename="${att.filename}"`);
      lines.push(`Content-ID: <${att.cid}>`);
    } else {
      lines.push(`Content-Disposition: attachment; filename="${att.filename}"`);
    }

    lines.push(`Content-Transfer-Encoding: base64`);
    lines.push("");
    lines.push(contentBuffer.toString("base64"));
    lines.push("");
  }

  // End boundary
  lines.push(`--${boundary}--`);
  const raw = lines.join("\r\n");
  return base64UrlEncode(raw);
}

/**
 * sendMail using Gmail REST API (no SMTP).
 * attachments: [{ filename, mimeType, content: Buffer or base64 string, cid? }]
 */
export const sendMail = async ({ to, subject, html, attachments = [] }) => {
  try {
    // ensure valid access token (oAuth2Client will use refresh token)
    const { token } = await oAuth2Client.getAccessToken();
    if (!token) throw new Error("Failed to obtain access token from Google");

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const from = process.env.SENDER_EMAIL;
    const raw = buildRawMessage({ from, to, subject, html, attachments });

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw }
    });

    logger.info("Email sent via Gmail API", { to, subject, id: res.data?.id });
    return res.data;
  } catch (err) {
    // surface useful error info in your logs
    logger.error("Email sending failed (Gmail API)", {
      message: err?.message,
      response: err?.response?.data || null
    });
    throw err;
  }
};

export default { sendMail };
