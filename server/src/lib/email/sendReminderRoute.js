import { Receiver } from "@upstash/qstash";
import { sendMail } from "../mailer.js";
import prisma from "../prisma.js";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
});

export const sendReminderRoute = [
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

  async (req, res, next) => {
    try {
      const { email, eventId, eventTitle, attendeeName, userId } =
        req.body || {};

      if (!email || !eventId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const html = `
        <p>Hello ${attendeeName || ""},</p>
        <p>This is a reminder that the event <b>${eventTitle || ""}</b> is happening in 24 hours.</p>
      `;

      await sendMail({
        to: email,
        subject: `Reminder: ${eventTitle || "Your event"} is Tomorrow`,
        html
      });

      let notification = null;
      try {
        notification = await prisma.notification.create({
          data: {
            userId: userId || null,
            eventId,
            title: "Event Reminder",
            message: `Your event "${eventTitle || ""}" starts in 24 hours.`,
            type: "event_reminder"
          }
        });
      } catch (dbErr) {
        return next(dbErr);
      }

      const io = req.app.get("io");
      if (io && userId) {
        io.to(`user:${userId}`).emit("notification:new", {
          id: notification?.id || null,
          type: notification?.type || "event_reminder",
          title: notification?.title || "Event Reminder",
          message:
            notification?.message ||
            `Your event "${eventTitle || ""}" starts in 24 hours.`,
          eventId,
          createdAt: notification?.createdAt || new Date().toISOString()
        });
      }

      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to send reminder" });
    }
  }
];

export default { sendReminderRoute };
