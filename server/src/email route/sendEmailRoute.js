import { Receiver } from "@upstash/qstash";
import transporter from "../lib/mailer.js";
import { VerifyTemplate } from "../lib/email/template/VerifyTemplate.js";
import { ResetTemplate } from "../lib/email/template/ResetTemplate.js";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
});

// middleware version – SIMPLE
const verifyMiddleware = async (req, res, next) => {
  try {
    const signature = req.headers["upstash-signature"];

    // QStash sends normal JSON, so req.body is fine
    const bodyString = JSON.stringify(req.body);

    await receiver.verify({
      signature,
      body: bodyString
    });

    next();
  } catch (err) {
    console.error("Signature verification failed:", err);
    return res.status(401).json({ error: "Invalid signature" });
  }
};

// your main handler
const handler = async (req, res) => {
  try {
    const payload = req.body;

    console.log("QStash email request:", payload);

    if (payload.type === "verification") {
      const html = VerifyTemplate({
        username: payload.username,
        url: payload.url
      });

      await transporter.sendMail({
        to: payload.email,
        subject: "Verify your email",
        html
      });
    }

    if (payload.type === "reset") {
      const html = ResetTemplate({
        username: payload.username,
        url: payload.url
      });

      await transporter.sendMail({
        to: payload.email,
        subject: "Reset your password",
        html
      });
    }

    if (payload.type === "ticket") {
      await transporter.sendMail({
        to: payload.email,
        subject: "Your Ticket",
        html: `
          <p>Hello ${payload.attendeeName}, here’s your ticket!</p>
          <img src="cid:ticketqr" />
        `,
        attachments: [
          {
            filename: "ticket.png",
            path: payload.qrPath,
            cid: "ticketqr"
          }
        ]
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Email failed" });
  }
};

export const sendEmailRoute = [verifyMiddleware, handler];
