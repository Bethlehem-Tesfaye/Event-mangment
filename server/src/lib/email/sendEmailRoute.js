import { Receiver } from "@upstash/qstash";
import { sendMail } from "../mailer.js";

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
      return res.status(401).json({ error: "Invalid signature" });
    }
  },

  async (req, res) => {
    try {
      const payload = req.body || {};
      if (!payload.type || !payload.email)
        return res.status(400).json({ error: "Invalid payload" });

      const attachments = [];
      let html = `<p>Hello,</p><p>This is a ${payload.type} email.</p>`;

      // ticket emails (QR url or base64 attachment)
      if (payload.type === "ticket") {
        if (payload.qrUrl) {
          html = `<p>Hello ${payload.attendeeName || ""},</p>
                    <a href="${payload.recoveryLink}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">View My Ticket / Recover</a>
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
          if (payload.recoveryLink) {
            html += `<p style="margin-top:16px;">
                    <a href="${payload.recoveryLink}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">View My Ticket / Recover</a>
                   </p>
                   <p style="font-size:12px;color:#666;">Use this link anytime to recover your ticket.</p>`;
          }
        }
      } else if (payload.type === "otp") {
        html = `<p>Hello ${payload.email || ""},</p>
                <p>Your OTP for ticket recovery is:</p>
                <h2>${payload.otp}</h2>
                <p style="font-size:12px;color:#666;">Valid for 10 minutes.</p>`;
      } else if (
        payload.type === "verification" ||
        payload.type === "verification_email" ||
        payload.type === "verification_link"
      ) {
        // verification emails from publishEmailJob (better-auth) include a url
        const url = payload.url || payload.verificationUrl || payload.link;
        const username = payload.username || payload.email || "";
        html = `<div style="font-family:sans-serif;line-height:1.6">
                  <p>Hello ${username},</p>
                  <p>Please verify your email address to activate your account.</p>
                  ${
                    url
                      ? `<p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">Verify Email</a></p>
                         <p style="font-size:12px;color:#666">If the button doesn't work, paste this link into your browser:<br/><code>${url}</code></p>`
                      : `<p style="color:#666">Verification link not provided.</p>`
                  }
                </div>`;
      } else if (
        payload.type === "reset" ||
        payload.type === "reset_password" ||
        payload.type === "password_reset"
      ) {
        const url = payload.url || payload.resetUrl || payload.link;
        const username = payload.username || payload.email || "";
        html = `<div style="font-family:sans-serif;line-height:1.6">
                  <p>Hello ${username},</p>
                  <p>You requested a password reset. Click the button below to continue:</p>
                  ${
                    url
                      ? `<p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a></p>
                         <p style="font-size:12px;color:#666">If the button doesn't work, paste this link into your browser:<br/><code>${url}</code></p>`
                      : `<p style="color:#666">Reset link not provided.</p>`
                  }
                </div>`;
      } else if (payload.html) {
        html = payload.html;
      } else if (payload.message) {
        html = `<p>Hello ${payload.username || ""},</p><p>${payload.message}</p>`;
      } else if (payload.text) {
        html = `<p>${payload.text}</p>`;
      } else {
        html = `<p>Hello,</p><p>This is a ${payload.type} email.</p>`;
      }

      await sendMail({
        to: payload.email,
        subject:
          payload.subject ||
          (payload.type === "ticket"
            ? "Your Ticket"
            : payload.type || "Notification"),
        html,
        attachments: attachments.length ? attachments : undefined
      });
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: "Email failed" });
    }
  }
];
