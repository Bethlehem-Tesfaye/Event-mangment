/* eslint-disable no-console */
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
        return res.status(400).json({ error: "Invalid payload" });
      }

      let attachments = [];

      // default html
      let html = `<p>Hello,</p><p>This is a ${payload.type} email.</p>`;

      if (payload.type === "ticket") {
        // Prefer hosted image URL (Cloudinary)
        if (payload.qrUrl) {
          html = `
            <p>Hello ${payload.attendeeName || ""},</p>
            <p>Your ticket is below — show this at the event:</p>
            <p><img src="${payload.qrUrl}" alt="Ticket QR" style="max-width:320px"/></p>
          `;
        } else if (payload.qrBase64) {
          try {
            const qrBuffer = Buffer.from(payload.qrBase64, "base64");
            attachments.push({
              filename: "ticket.png",
              cid: "qrimage",
              content: qrBuffer
            });
            html = `
              <p>Hello ${payload.attendeeName || ""}, your ticket is attached (if available).</p>
              <p>Scan the QR code at the event.</p>
              <img src="cid:qrimage"/>
            `;
          } catch (err) {
            console.error(
              "Failed to decode qrBase64, sending without attachment:",
              err?.message || err
            );
            // keep default html
          }
        } else {
          console.warn(
            "No qrUrl or qrBase64 present; sending ticket email without QR"
          );
        }
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
      return res
        .status(500)
        .json({ error: "Email failed", detail: err?.message || "unknown" });
    }
  }
];
