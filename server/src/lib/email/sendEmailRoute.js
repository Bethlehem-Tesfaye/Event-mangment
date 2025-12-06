import { Receiver } from "@upstash/qstash";
import transporter from "../mailer.js";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
});

export const sendEmailRoute = [
  async (req, res, next) => {
    try {
      const signature = req.headers["upstash-signature"];
      const bodyString = req.rawBody || JSON.stringify(req.body || {});
      await receiver.verify({ signature, body: bodyString });
      return next();
    } catch (err) {
      console.error("Signature verification failed:", err?.message || err);
      return res.status(401).json({ error: "Invalid signature" });
    }
  },

  async (req, res) => {
    try {
      const payload = req.body || {};
      if (!payload.type || !payload.email)
        return res.status(400).json({ error: "Invalid payload" });

      let attachments = [];
      let html = `<p>Hello,</p><p>This is a ${payload.type} email.</p>`;

      if (payload.type === "ticket") {
        if (payload.qrUrl) {
          html = `<p>Hello ${payload.attendeeName || ""},</p>
                  <p>Your ticket:</p>
                  <img src="${payload.qrUrl}" alt="Ticket QR" style="max-width:320px"/>`;
        } else if (payload.qrBase64) {
          const qrBuffer = Buffer.from(payload.qrBase64, "base64");
          attachments.push({
            filename: "ticket.png",
            cid: "qrimage",
            content: qrBuffer
          });
          html = `<p>Hello ${payload.attendeeName || ""}, your ticket is attached.</p>
                  <p>Scan the QR code at the event.</p>
                  <img src="cid:qrimage"/>`;
        }
      }

      const info = await transporter.sendMail({
        to: payload.email,
        subject: payload.type === "ticket" ? "Your Ticket" : "Notification",
        html,
        attachments: attachments.length ? attachments : undefined
      });

      console.log("Email sent:", { messageId: info.messageId });
      return res.json({ ok: true });
    } catch (err) {
      console.error("Email handler error:", err?.message || err);
      return res.status(500).json({ error: "Email failed" });
    }
  }
];
