import { Receiver } from "@upstash/qstash";
import transporter from "../mailer.js";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
});

export const sendEmailRoute = [
  // verification middleware: prefer rawBody when available
  async (req, res, next) => {
    try {
      const signature = req.headers["upstash-signature"];
      const bodyString = req.rawBody || JSON.stringify(req.body || {});

      // log minimal info for debugging
      console.log(
        "QStash verify: signature present:",
        !!signature,
        "bodyLen:",
        (bodyString || "").length
      );

      await receiver.verify({
        signature,
        body: bodyString
      });

      return next();
    } catch (err) {
      console.error("Signature verification failed:", err?.message || err);
      return res.status(401).json({ error: "Invalid signature" });
    }
  },

  // handler
  async (req, res) => {
    try {
      const payload = req.body || {};
      console.log("Email job received:", {
        type: payload.type,
        email: payload.email,
        eventId: payload.eventId
      });

      if (!payload.type || !payload.email) {
        console.warn("Missing required payload fields", { payload });
        // respond 400 so QStash sees client error and won't retry
        return res.status(400).json({ error: "Invalid payload" });
      }

      let attachments = [];

      if (payload.type === "ticket") {
        if (payload.qrBase64) {
          try {
            const qrBuffer = Buffer.from(payload.qrBase64, "base64");
            attachments.push({
              filename: "ticket.png",
              cid: "qrimage",
              content: qrBuffer
            });
          } catch (err) {
            console.error(
              "Failed to decode qrBase64, will send email without attachment:",
              err?.message || err
            );
            // continue without attachment
          }
        } else {
          console.warn(
            "qrBase64 missing; sending ticket email without attachment"
          );
        }
      }

      // build HTML per type (minimal)
      let html = `<p>Hello,</p><p>This is a ${payload.type} email.</p>`;
      if (payload.type === "ticket") {
        html = `
          <p>Hello ${payload.attendeeName || ""}, your ticket is attached (if available).</p>
          <p>Scan the QR code at the event.</p>
          ${attachments.length ? '<img src="cid:qrimage"/>' : ""}
        `;
      }

      const info = await transporter.sendMail({
        to: payload.email,
        subject: payload.type === "ticket" ? "Your Ticket" : "Notification",
        html,
        attachments: attachments.length ? attachments : undefined
      });

      console.log("Email sent:", {
        messageId: info?.messageId,
        response: info?.response
      });
      return res.json({ ok: true });
    } catch (err) {
      console.error("Email handler error:", err?.message || err, err?.stack);
      // return 500 so QStash will show delivery failure in dashboard
      return res
        .status(500)
        .json({ error: "Email failed", detail: err?.message || "unknown" });
    }
  }
];
