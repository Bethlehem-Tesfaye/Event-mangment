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
      const bodyString = JSON.stringify(req.body);

      await receiver.verify({
        signature,
        body: bodyString
      });

      return next();
    } catch (err) {
      console.error("Signature verification failed:", err);
      return res.status(401).json({ error: "Invalid signature" });
    }
  },

  async (req, res) => {
    try {
      const payload = req.body;

      console.log("Email job received:", payload.type);

      if (payload.type === "ticket") {
        // Convert QR back to buffer
        const qrBuffer = Buffer.from(payload.qrBase64, "base64");

        const info = await transporter.sendMail({
          to: payload.email,
          subject: "Your Ticket",
          html: `
            <p>Hello ${payload.attendeeName}, your ticket is attached.</p>
            <p>Scan the QR code at the event.</p>
            <img src="cid:qrimage"/>
          `,
          attachments: [
            {
              filename: "ticket.png",
              cid: "qrimage",
              content: qrBuffer
            }
          ]
        });

        console.log("Ticket email sent:", info.messageId);
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error("Email handler error:", err);
      return res.status(500).json({ error: "Email failed" });
    }
  }
];
